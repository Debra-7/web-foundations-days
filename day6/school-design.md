# School Database Design

## 1. Table Explanations

### Students
The `students` table stores information about each student, including their ID, first name, last name, and email address. The student ID uniquely identifies each student, while the unique constraint on email prevents two students from using the same email address.

### Courses
The `courses` table stores information about the courses offered by the school. It contains a course ID and course name. The course ID uniquely identifies each course, and the unique constraint on course name prevents duplicate course names.

### Enrolments
The `enrolments` table records which students are enrolled in which courses. It contains an enrolment ID, student ID, course ID, and grade. The student ID and course ID are foreign keys that connect enrolments to the students and courses tables. The combination of student ID and course ID is unique, preventing a student from enrolling in the same course more than once. The grade can be `NULL` when a grade has not yet been assigned.

## 2. Relationships Between Tables

### One-to-Many Relationships
There is a one-to-many relationship between `students` and `enrolments` because one student can have multiple enrolment records, while each enrolment belongs to one student.

There is also a one-to-many relationship between `courses` and `enrolments` because one course can have multiple enrolment records, while each enrolment refers to one course.

### Many-to-Many Relationship
Students and courses have a many-to-many relationship because one student can enrol in several courses, and one course can have several students. The `enrolments` table acts as a junction table between `students` and `courses`. This avoids storing multiple course IDs in a single student record and allows each enrolment to have its own grade.

## 3. Index Choice

I would create an index on the `course_id` column in the `enrolments` table:

```sql
CREATE INDEX idx_enrolments_course_id
ON enrolments(course_id);
```

This index can improve the performance of queries that search for enrolments by course ID or group enrolments by course. It can also help when joining courses to enrolments. Although indexes can speed up queries, they require additional storage and can add overhead when inserting or updating records.

## 4. SQL vs NoSQL

I would use a relational SQL database for this school database because the data is structured and has clear relationships between students, courses, and enrolments. SQL supports primary keys, foreign keys, unique constraints, and joins, which help maintain data accuracy and retrieve related information efficiently. A NoSQL database can be useful for flexible or rapidly changing data structures, but it is not necessary for this project. A relational database such as SQLite is suitable for this small assignment.
