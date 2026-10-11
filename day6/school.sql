PRAGMA foreign_keys = ON;

CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY,
    course_name TEXT NOT NULL UNIQUE
);

CREATE TABLE enrolments (
    enrolment_id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL ,
    grade TEXT,

    FOREIGN KEY (student_id) REFERENCES students (student_id),
    FOREIGN KEY (course_id) REFERENCES courses (course_id),
    UNIQUE (student_id, course_id)
);

INSERT INTO students (student_id, first_name, last_name, email)
VALUES
    ( 1, 'Paul', 'Desmond', 'paul@example.com' ),
    ( 2, 'Lewiso', 'Chico', 'lewiso@example.com' ),
    ( 3, 'Judy', 'Kimani', 'judy@example.com' ),
    ( 4, 'Papa', 'Whena', 'papa@example.com' ),
    ( 5, 'Georgina', 'Otter', 'georgina@example.com');

INSERT INTO courses (course_id, course_name)
VALUES
    ( 1, 'Engineering Ethics' ),
    ( 2, 'Medical Physiology'),
    ( 3, 'Biomechanics'),
    ( 4, 'Biomaterials'),
    ( 5, 'Power Systems'),
    ( 6, 'Fluid Mechanics');

INSERT INTO enrolments (enrolment_id, student_id, course_id, grade)
VALUES
    ( 1, 1, 1, 'A'),
    ( 2, 1, 2, 'C'),
    ( 3, 1, 3, NULL),
    ( 4, 2, 1, 'B'),
    ( 5, 2, 3, 'B'),
    ( 6, 3, 1, NULL),
    ( 7, 3, 5, 'A'),
    ( 8, 4, 4, 'B'),
    ( 9, 4, 1, NULL),
    ( 10, 4, 2, 'B'),
    ( 11, 5, 4, 'C'),
    ( 12, 5, 5, 'A'),
    ( 13, 5, 1, 'C');

SELECT courses.course_name
FROM students
JOIN enrolments
    ON students.student_id = enrolments.student_id
JOIN courses 
    ON courses.course_id = enrolments.course_id
WHERE first_name = 'Paul'
    AND last_name = 'Desmond';

SELECT students.first_name, students.last_name
FROM courses
JOIN enrolments
    ON courses.course_id = enrolments.course_id
JOIN students
    ON students.student_id = enrolments.student_id
WHERE course_name = 'Engineering Ethics';

SELECT courses.course_name, COUNT(enrolments.student_id)
FROM courses
LEFT JOIN enrolments
    ON courses.course_id = enrolments.course_id
GROUP BY courses.course_name;

SELECT first_name, last_name
FROM students
LEFT JOIN enrolments
    ON students.student_id = enrolments.student_id
WHERE enrolments.student_id IS NULL;

UPDATE enrolments
SET grade = 'A'
WHERE student_id = 1 AND course_id = 3;

SELECT *
FROM enrolments
WHERE student_id = 1 AND course_id = 3;