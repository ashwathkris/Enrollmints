from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import os
import json
from mysql.connector import Error
from collections import defaultdict
from datetime import datetime

from mysql.connector.errors import InterfaceError, DatabaseError

app = Flask(__name__)
CORS(app)

# Database connection
db = mysql.connector.connect(
    host="34.31.101.102",
    user="vibhav.adivi",
    password="vibad4824",
    database="Enrollmints",
    ssl_ca='server-ca.pem',
    ssl_cert='client-cert.pem',
    ssl_key='client-key.pem'
)


@app.route('/registration/<netId>', methods=['POST'])
def registration(netId):
    data = request.get_json()
    crn = int(data.get('course'))
    netId = int(netId)
    semester = "Fall 2024"
    if not crn:
        return jsonify({'error': 'Missing CRN data'}), 400
    cursor = db.cursor(dictionary=True)
    try:
        # Check if the user has already taken that course
        cursor.execute("""
            SELECT * FROM Enrollments WHERE NetID=%s AND CRN=%s
        """, (netId, crn))
        if cursor.fetchone():
            return jsonify({'error': 'User has already taken this course'}), 409

        # Check if the course is actually being offered in the semester 'Fall 2024'
        cursor.execute("""
            SELECT * FROM Courses WHERE CRN=%s AND Semester=%s
        """, (crn, semester))
        course = cursor.fetchone()
        if not course:
            return jsonify({'error': 'Course not offered this semester'}), 404

        # Check for time clashes
        try:
            cursor.execute("""
                SELECT * FROM Enrollments e JOIN Courses c ON e.CRN = c.CRN
                WHERE e.NetID=%s AND c.Semester=%s AND (
                    c.Start_Time < %s AND c.End_Time > %s
                )
            """, (netId, semester, course['End_Time'], course['Start_Time']))
        except Error as e:
            print(e)
        if cursor.fetchone():
            return jsonify({'error': 'Time clash with another course'}), 409

        cursor.execute("""
            INSERT INTO Enrollments (NetID, CRN, Semester) VALUES (%s, %s, %s)
        """, (netId, crn, semester))
        db.commit()
        return jsonify({'success': 'Course registered successfully'}), 200

    except Error as e:
        db.rollback()
        print(e)
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()

@app.route('/registration/<netId>/delete', methods=['DELETE'])
def delete_registration(netId):
    try:
        data = request.get_json()
        crn = int(data.get('course'))
        netId = int(netId)
        semester = "Fall 2024"
        print(crn)
        if not crn:
            return jsonify({'error': 'Missing CRN data'}), 400
        cursor = db.cursor(dictionary=True)
        
        # Delete the course registration
        cursor.execute("""
            DELETE FROM Enrollments WHERE NetID=%s AND CRN=%s
        """, (netId, crn))
        db.commit()
        print('deleted')
        return jsonify({'success': 'Course deleted successfully'}), 200
    except Error as e:
        db.rollback()
        print(e)
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()


@app.route('/courses', methods=['GET'])
def get_courses():
    course_code_prefix = request.args.get('courseCode')
    semester = request.args.get('semester')
    search_query = request.args.get('searchQuery')
    query = "SELECT DISTINCT * FROM Courses WHERE 1=1 AND Semester = 'Fall 2024'"  # Start with a condition that's always true
    
    if course_code_prefix:
        query += f" AND Course_Code LIKE 'CS 5%'"
    if semester:
        query += f" AND Semester = 'Spring 2024'"
    if search_query:
        query += " AND (Course_Name LIKE '%" + search_query + "%' OR Course_Code LIKE '%" + search_query + "%')"
    # query += " LIMIT 100"
    print(query)
    db.reconnect()
    cursor = db.cursor(dictionary=True)
    cursor.execute(query)
    courses = cursor.fetchall()
    return json.dumps(courses, indent=4, sort_keys=True, default=str)

@app.route('/courses/<courseCode>', methods=['GET'])
def get_course_details(courseCode):
    courseCode = courseCode.replace('_', ' ')
    db.reconnect()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT c.Course_Code, c.Course_Name, c.Credits, c.Breadth, c.Department, c.Is_Online, c.Time, c.Day, c.Location, i.ProfessorName FROM Courses c join Instructors i WHERE Course_Code = %s and Semester = 'Fall 2024'", (courseCode,))

    courses = cursor.fetchall()
    if courses:
        for course in courses:
            # Convert datetime fields to strings
            for key, value in course.items():
                if isinstance(value, datetime):
                    course[key] = value.strftime('%Y-%m-%d %H:%M:%S')


        return jsonify(course)
    else:
        return jsonify({"error": "Course not found"}), 404

@app.route('/login', methods=['GET'])
def login():
    net_id = request.args.get('netId')
    cursor = db.cursor(dictionary=True)
    query = "SELECT NetID FROM Students WHERE NetID = %s"
    cursor.execute(query, (net_id,))
    student = cursor.fetchone()
    return json.dumps(student)

@app.route('/suggest_courses/<int:netid>')
def suggest_courses(netid):
    db.reconnect()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT DISTINCT Breadth FROM Courses WHERE Breadth IS NOT NULL AND Breadth != ''")
    all_breadths = {row['Breadth'] for row in cursor.fetchall()}

    # Determine which breadth areas the student has covered, excluding empty breadth
    cursor.execute("""
        SELECT DISTINCT Breadth
        FROM Courses JOIN Enrollments ON Courses.CRN = Enrollments.CRN
        WHERE Enrollments.NetID = %s AND Courses.Breadth IS NOT NULL AND Courses.Breadth != ''
    """, (netid,))
    taken_breadths = {row['Breadth'] for row in cursor.fetchall()}
    missing_breadths = all_breadths - taken_breadths

    suggested_breadth_courses = []
    if len(taken_breadths) < 4:
        placeholders = ', '.join(['%s'] * len(missing_breadths))
        cursor.execute(f"""
            SELECT DISTINCT Course_Code, Course_Name, Breadth
            FROM Courses
            WHERE Breadth IN ({placeholders}) AND CRN NOT IN (
                SELECT CRN FROM Enrollments WHERE NetID = %s
            )
        """, tuple(missing_breadths) + (netid,))
        suggested_breadth_courses = cursor.fetchall()

    # Fetch and ensure unique advanced courses taken
    cursor.execute("""
        SELECT DISTINCT Course_Code, Course_Name, Breadth
        FROM Courses
        WHERE Course_Code LIKE 'CS 5%%' AND CRN IN (
            SELECT CRN FROM Enrollments WHERE NetID = %s
        )
    """, (netid,))
    taken_adv_courses = cursor.fetchall()
    taken_adv_count = len({(course['Course_Code'], course['Breadth']) for course in taken_adv_courses})

    suggested_advanced_courses = []
    if taken_adv_count < 3:
        cursor.execute(f"""
            SELECT DISTINCT Course_Code, Course_Name, Breadth
            FROM Courses
            WHERE Course_Code LIKE 'CS 5%%' AND CRN NOT IN (
                SELECT CRN FROM Enrollments WHERE NetID = %s
            )
        """, (netid,))
        suggested_advanced_courses = cursor.fetchall()

    response = {
        "suggested_breadth_courses": suggested_breadth_courses,
        "suggested_advanced_courses": suggested_advanced_courses,
        "taken_advanced_courses": taken_adv_courses,
        "taken_breadths": list(taken_breadths)
    }
    return jsonify(response)


@app.route('/dashboard/<int:netid>')
def dashboard(netid):
    db.reconnect()  
    cursor = db.cursor(dictionary=True)  
    print(netid)
    sql = """
    SELECT DISTINCT
        C.Course_Name,
        C.Course_Code,
        C.Breadth, 
        C.Credits,
        C.Semester
    FROM 
        Courses C
    NATURAL JOIN 
        Enrollments E
    WHERE 
        E.NetID = %s
    ORDER BY
        C.Semester;
    """
    cursor.execute(sql, (netid,))
    courses = cursor.fetchall()
    courses2 = courses

    sql2 = """
    SELECT Degree_Name
    FROM Students
    WHERE NetID = %s;
    """
    cursor.execute(sql2, (netid,))
    degree_name = cursor.fetchall()[0]['Degree_Name']
    breadth_requirement = 3 if degree_name == "MSCS" else 4

    if not courses:
        return jsonify({"error": "No courses found for this NetID"}), 404

    course_data = {'BreadthCourses': [], 'AdvancedCourses': [], 'OtherCourses': [], 'DistinctBreadthCourses': []}
    recategorized = {'BreadthCourses': [], 'AdvancedCourses': [], 'OtherCourses': []}
    for course in courses:
        if course['Breadth']:
            course_data['BreadthCourses'].append(course)
        elif course['Course_Code'].startswith('CS 5'):
            course_data['AdvancedCourses'].append(course)
        else:
            course_data['OtherCourses'].append(course)

    # first handle distinct breadths
    distinct_Breadths = set()
    for c in course_data['BreadthCourses']:
        if c['Breadth'] not in distinct_Breadths:
            distinct_Breadths.add(c['Breadth'])
            course_data['DistinctBreadthCourses'].append(c)
        elif c['Course_Code'].startswith('CS 5'):
            course_data['AdvancedCourses'].append(c)
        else:
            course_data['OtherCourses'].append(c)

    # now handle excess courses in DistinctBreadthCourses
    newb_courses = course_data['DistinctBreadthCourses']
    sorted_newb_courses = sorted(newb_courses, key=lambda x: x['Course_Code'])
    if len(sorted_newb_courses) > breadth_requirement:
        recategorized['BreadthCourses'] = sorted_newb_courses[:breadth_requirement]
        for c in sorted_newb_courses[breadth_requirement:]:
            if c['Course_Code'].startswith('CS 5') and len(course_data['AdvancedCourses']) < 3:
                course_data['AdvancedCourses'].append(c)
            else:
                course_data['OtherCourses'].append(c)
    else:
        recategorized['BreadthCourses'] = course_data['DistinctBreadthCourses']
    recategorized['AdvancedCourses'] = course_data['AdvancedCourses']
    recategorized['OtherCourses'] = course_data['OtherCourses']
    
    # Ensure no course is lost or duplicated
    recategorized["Degree_Name"] = degree_name
    assert len(courses) == len(recategorized['AdvancedCourses']) + len(recategorized['BreadthCourses']) + len(recategorized['OtherCourses']), "Course counts mismatch!"
    # return jsonify(recategorized)

    def compute_total_credits(courses):
        total_credits = 0
        for course in courses:
            credits_str = course["Credits"]
            # Extracting the numerical part of the credits string
            credits_num = int(credits_str.split()[0])
            total_credits += credits_num
        return total_credits
    credis_completed = compute_total_credits(courses2)

    semester_courses = defaultdict(list)
    for course in courses2:
        semester_courses[course["Semester"]].append(course)

    semester_courses = dict(semester_courses)
    semester_courses['breadths_completed'] = len(recategorized['BreadthCourses'])
    semester_courses['breadth_requirement'] = breadth_requirement
    semester_courses['depths_completed'] = len(recategorized['AdvancedCourses'])
    semester_courses['depth_requirement'] = 3
    semester_courses['credits_completed'] = credis_completed
    semester_courses['credit_requirement'] = 32
    return jsonify(semester_courses)    

# @app.route('/reviews', methods=['GET'])
# def get_reviews():
#     try:
#         db.reconnect()
#         professor = request.args.get('professor', default='%')
#         course = request.args.get('course', default='%')
#         sort_order = request.args.get('sort', default='DESC')

#         cursor = db.cursor(dictionary=True)
#         cursor.execute("""
#                 SELECT r.Review_ID, r.Course_Code, r.Review, r.Semester, r.Rating, i.ProfessorName
#                 FROM Reviews r
#                 LEFT JOIN Instructors i ON r.InstructorID = i.InstructorID
#                 WHERE i.ProfessorName LIKE %s AND r.Course_Code LIKE %s
#                 ORDER BY r.Rating {}
#             """.format(sort_order), (f"%{professor}%", f"%{course}%"))
#         reviews = cursor.fetchall()
#         return jsonify(reviews)

#     except (InterfaceError, DatabaseError) as e:
#             print("Connection lost. Attempting to reconnect...")
#             db.reconnect(attempts=10, delay=5)
#             return get_reviews()

@app.route('/reviews', methods=['GET'])
def get_reviews():
    try:
        db.reconnect()
        professor = request.args.get('professor', default='%')
        course = request.args.get('course', default='%')
        sort_order = request.args.get('sort', default='DESC').upper()  # Ensure the sort order is uppercase

        cursor = db.cursor(dictionary=True)
        cursor.callproc('GetReviews', [professor, course, sort_order])
        
        # Extracting results from a stored procedure call
        for result in cursor.stored_results():
            reviews = result.fetchall()
        
        return jsonify(reviews)

    except (InterfaceError, DatabaseError) as e:
        print("Connection lost. Attempting to reconnect...")
        db.reconnect(attempts=10, delay=5)
        return get_reviews()
    finally:
        cursor.close()
        db.close()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=os.getenv('PORT', 5000))
