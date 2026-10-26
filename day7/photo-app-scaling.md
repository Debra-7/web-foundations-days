# SnapShare: Scaling Plan

## 1. Assumptions

This scaling plan is based on the following assumptions:

- SnapShare has 10 million registered users.
- 10% of registered users are active each day.
- Each daily active user uploads one photo per day.
- Each daily active user views 50 feed pages per day.
- Each original photo has an average size of 2 MB.
- Each photo has one thumbnail with an average size of 50 KB.
- A day contains 86,400 seconds, and average request rates are calculated across the entire day.
- Peak feed traffic is estimated to be five times the average feed request rate.
- All original photos and thumbnails are retained for one year.
- Storage estimates exclude backups, database metadata, replication overhead, and storage overhead.
- Each feed page view is treated as one feed request for this simplified estimate.

## 2. Load Estimates

### Daily Active Users (DAU)

Daily active users are 10% of the 10 million registered users.

Calculation:

10,000,000 × 0.10 = 1,000,000 daily active users

**Daily active users: 1 million**

### Uploads per Second

Each daily active user uploads one photo per day.

Daily uploads:

1,000,000 × 1 = 1,000,000 uploads per day

Average uploads per second:

1,000,000 ÷ 86,400 = 11.57 uploads per second

**Average upload rate: approximately 12 uploads per second.**

### Feed Views per Second

Each daily active user views 50 feed pages per day.

Daily feed views:

1,000,000 × 50 = 50,000,000 feed views per day

Average feed views per second:

50,000,000 ÷ 86,400 = 578.70 feed views per second

**Average feed request rate: approximately 579 requests per second.**

Peak feed views per second are estimated using a peak factor of 5.

Peak feed views per second:

578.70 × 5 = 2,893.52 feed views per second

**Estimated peak feed request rate: approximately 2,894 requests per second.**

These estimates represent feed page requests, not the total number of individual image downloads, which could be much higher.

### Photo Storage per Year

Each original photo occupies 2 MB.

Daily original photo storage:

1,000,000 × 2 MB = 2,000,000 MB per day

Annual original photo storage:

2,000,000 × 365 = 730,000,000 MB per year

Using decimal storage units, where 1 TB = 1,000,000 MB:

730,000,000 ÷ 1,000,000 = 730 TB per year

Each thumbnail occupies 50 KB, equivalent to 0.05 MB using decimal units.

Daily thumbnail storage:

1,000,000 × 0.05 MB = 50,000 MB per day

Annual thumbnail storage:

50,000 × 365 = 18,250,000 MB per year

18,250,000 ÷ 1,000,000 = 18.25 TB per year

Total annual image storage:

730 TB + 18.25 TB = 748.25 TB per year

| Metric | Estimated value |
|---|---:|
| Registered users | 10,000,000 |
| Daily active users | 1,000,000 |
| Daily photo uploads | 1,000,000 |
| Average uploads per second | 11.57 |
| Daily feed views | 50,000,000 |
| Average feed views per second | 578.70 |
| Peak feed views per second | 2,893.52 |
| Original photo storage per year | 730 TB |
| Thumbnail storage per year | 18.25 TB |
| Total image storage per year | 748.25 TB |

## 3. Is SnapShare Read-Heavy or Write-Heavy?

SnapShare is a **read-heavy system** because users view feed pages much more frequently than they upload photos.

The application receives approximately 50 million feed views and 1 million photo uploads per day. This means there are approximately 50 feed views for every photo upload.

The architecture should therefore prioritize fast feed delivery and reducing repeated database queries. A cache can store frequently accessed feed data, a CDN can deliver photos closer to users, and a database read replica can serve eligible read requests. Uploads and other database changes will be handled by the primary database.

## 4. Photo Storage: Database vs Object Storage

The actual photo files should be stored in object storage rather than directly inside the database.

Storing large image files in database rows would increase database size, backup time, storage costs, and the amount of data the database must manage. It would also make it harder to scale image delivery independently from application data.

Object storage is designed to store large files and can scale to accommodate the hundreds of terabytes of new images SnapShare expects to generate each year.

The database will store photo metadata, including the photo ID, owner ID, caption, object-storage key, upload timestamp, and thumbnail status. The original photo and thumbnail will be stored as separate objects, with their storage keys recorded in the database.

A CDN will deliver cached images to users while retrieving uncached images from object storage.

## 5. Architecture Diagram

```text
                         +----------------------+
                         |   Users / Clients    |
                         | Browser / Mobile App |
                         +----------+-----------+
                                    |
                                    v
                         +----------------------+
                         |         DNS          |
                         +----------+-----------+
                                    |
                                    v
                         +----------------------+
                         |         CDN          |
                         | Static files & photos|
                         +----------+-----------+
                                    |
                         Dynamic API requests
                                    |
                                    v
                         +----------------------+
                         |    Load Balancer     |
                         +----------+-----------+
                                    |
                          +---------+---------+
                          |                   |
                          v                   v
                  +---------------+   +---------------+
                  | App Server 1  |   | App Server 2  |
                  +-------+-------+   +-------+-------+
                          |                   |
                          +---------+---------+
                                    |
                         +----------+-----------+
                         |                      |
                         v                      v
                  +-------------+       +----------------+
                  | Shared Cache|       | Message Queue  |
                  +------+------+       +-------+--------+
                         |                      |
                         |                      v
                         |              +----------------+
                         |              | Thumbnail      |
                         |              | Worker         |
                         |              +-------+--------+
                         |                      |
                         v                      v
                  +----------------+     +------------------+
                  | Read Replica   |     | Object Storage   |
                  |                |     | Original Photos  |
                  +--------^-------+     | & Thumbnails     |
                           |             +------------------+
                           |
                  +--------+-------+
                  | Primary Database|
                  | Photo Metadata  |
                  +-----------------+
```

**Database replication:** The primary database sends changes to the read replica.

**Photo uploads:** App servers write photo metadata to the primary database and store the original photo in object storage. They enqueue a thumbnail-generation job after the original upload succeeds.

**Thumbnail processing:** The worker reads jobs from the queue, retrieves the original photo from object storage, generates a thumbnail, and saves the thumbnail in object storage.

**Feed requests:** App servers check the cache for feed data, query the read replica when appropriate if the required data is missing, and return photo metadata and image references to the client.

**Image delivery:** Clients use the CDN to retrieve original photos and thumbnails. The CDN retrieves uncached images from object storage.

## 6. Components and the Problems They Solve

- **Users/Clients:** Provide the interface through which users upload photos and browse their feeds.
- **DNS:** Translates SnapShare's domain name into the address of the service entry point.
- **CDN:** Reduces image delivery latency and origin traffic by caching and serving images closer to users.
- **Load Balancer:** Distributes incoming API requests across application servers to avoid overloading a single server.
- **App Servers:** Handle authentication, upload validation, feed requests, business logic, and communication with other services.
- **Shared Cache:** Stores frequently requested feed data to reduce database load and improve response times.
- **Primary Database:** Stores authoritative photo metadata and processes database writes.
- **Read Replica:** Handles eligible read queries to reduce read pressure on the primary database.
- **Object Storage:** Stores original photos and generated thumbnails without filling the database with large image files.
- **Message Queue:** Holds thumbnail-generation jobs so image processing can happen asynchronously.
- **Thumbnail Worker:** Processes queued jobs, generates smaller image versions, and stores them in object storage.

## 7. Step-by-Step Photo Upload Flow

1. A user selects a photo and submits it through the SnapShare application.
2. The request reaches the load balancer, which forwards it to an available application server.
3. The application server authenticates the user and validates the request, including the file type and size.
4. The application stores the original photo in object storage, using a unique object key.
5. Once the original photo is successfully stored, the application saves its metadata in the primary database, including the owner ID, caption, object key, and upload timestamp.
6. The application publishes a thumbnail-generation job to the message queue.
7. The application returns a successful upload response to the user once the original photo and its required metadata have been safely saved and the job has been durably queued.
8. A background worker consumes the queued job and retrieves the original photo from object storage.
9. The worker generates a 50 KB thumbnail and stores it in object storage under a separate object key.
10. The worker updates the thumbnail status and metadata in the primary database.
11. The CDN can then serve the original photo and thumbnail to users, caching them according to the configured cache policy.

The queue and worker keep thumbnail processing outside the main upload request, allowing users to upload photos without waiting for thumbnail generation. If processing fails, the job can be retried, with safeguards against generating duplicate results.

The upload workflow should also handle partial failures. For example, if the original photo is stored successfully but the database write fails, the system should retry safely or clean up the unreferenced object. If a job cannot be queued, the application must not report the upload as fully complete until the job is durably recorded or another reliable recovery mechanism is in place.

## 8. Trade-Offs

### Trade-Off 1: Caching vs Data Freshness

Caching feed data reduces database queries and improves response times, especially during peak traffic. However, cached data can become outdated when users upload photos, delete content, or change who they follow.

SnapShare can invalidate or update affected cache entries when changes occur and use short expiration periods for data that changes frequently. This adds complexity and does not eliminate every possibility of stale data.

### Trade-Off 2: Read Replica vs Consistency

A read replica increases read capacity by handling eligible queries separately from the primary database. However, replication is asynchronous in many deployments, so recent changes may not immediately appear on the replica.

SnapShare can use the primary database for read-after-write requests that require the latest data, while sending other feed reads to the replica. This improves scalability but adds routing logic and database management complexity.

### Trade-Off 3: Asynchronous Thumbnail Generation vs Immediate Availability

Using a queue and background worker prevents thumbnail generation from slowing down the upload request. It also allows the system to retry failed jobs.

However, thumbnails may not be available immediately after an upload. SnapShare must track thumbnail status and display a placeholder or use the original photo until the thumbnail is ready. The queue and workers also require monitoring, retry policies, and failure handling.

### Trade-Off 4: Object Storage and CDN vs Operational Complexity

Object storage and a CDN allow image storage and delivery to scale independently from the application and database. They are well suited to SnapShare's large volume of image data.

However, they introduce additional infrastructure costs and configuration requirements, including access permissions, cache invalidation, storage lifecycle policies, and protection of private photos. SnapShare must configure the CDN and object storage so users can only access photos they are authorized to view.

## 9. Conclusion

SnapShare is a read-heavy photo-sharing application with approximately 1 million daily active users, 579 average feed requests per second, and an estimated peak of 2,894 feed requests per second.

It is expected to generate approximately 748.25 TB of new original-photo and thumbnail storage per year under the stated assumptions.

The proposed architecture distributes API traffic across multiple application servers, uses caching and a read replica to reduce database pressure, stores image files in object storage, and processes thumbnails asynchronously through a message queue and worker.

This design addresses the main scaling challenges while acknowledging trade-offs involving consistency, processing delays, reliability, and operational complexity.

