# Library Books API

This document dscribes a REST API for managing books in a library system.

## Endpoints

### 1. List all books
- **Method:** GET
- **Path:** `/books`
- **Description:** Returns a list of all books.
- **Success status:** `200 OK`

### 2. Get one book
- **Method:** GET
- **Path:** `/books/{id}`
- **Description:** Returns a single book using its ID.
- **Success status:** `200 OK`

### 3. Create a book
- **Method:** POST
- **Path:** `/books`
- **Description:** Adds a new book to the library.
- **Example request body:**
```json
{
    "title": "Things Fall Apart",
    "author": "Chinua Achebe",
    "publishedYear": 1958
    }
```
- **Suceess status:** `201 Created`

### 4. Update a book
- **Method:** PUT
- **Path:** `/books/{id}`
- **Description:** Updates the details of an existing book.
- **Example request body:**

  ```json
  {
    "title": "Things Fall Apart",
    "author": "Chinua Achebe",
    "publishedYear": 1958
  }
  ```

- **Success status:** `200 OK`

### 5. Delete a book

- **Method:** DELETE
- **Path:** `/books/{id}`
- **Description:** Deletes a book using its ID.
- **Success status:** `204 No Content`

### 6. List books by author

- **Method:** GET
- **Path:** `/books?author=Chinua%20Achebe`
- **Description:** Returns books written by the specified author using the `author` query parameter.
- **Success status:** `200 OK`

## Error Responses

### 400 Bad Request

- **Description:** The request contains invalid data.
- **Example:** A client tries to create a book without providing its required title.

### 404 Not Found

- **Description:** The requested resource does not exist.
- **Example:** A client requests `/books/999`, but no book with ID `999` exists.

