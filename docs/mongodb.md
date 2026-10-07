# MongoDB development database

This project uses the real MongoDB 8 server and the MongoDB Node.js driver. It does not replace the database with SQLite, JSON files, or an in-memory mock.

Start the local database with Docker and Docker Compose:

```sh
node scripts/mongo.mjs start
```

The helper waits for the container health check and verifies a MongoDB `adminCommand({ ping: 1 })`. The default application connection is `mongodb://127.0.0.1:27017/ielts_ai`. The container publishes its port only on loopback, so this development database is not exposed to the Internet. Data persists in the ignored `.local/mongo` directory between application restarts and database container recreation.

```sh
node scripts/mongo.mjs status
node scripts/mongo.mjs stop
```

Stopping preserves data. Starting again reuses the same files. Do not remove `.local/mongo` unless you intend to delete local learner accounts, activity, and saved progress.

The official `mongo:8.0` image is pinned to its verified registry digest in `compose.yaml`, making the setup reproducible. Docker verifies image layers when downloading them; TLS and checksums remain enabled. Updating MongoDB requires reviewing the new official image digest and compatibility before changing this pin.

For production, supply a MongoDB Atlas or other authenticated MongoDB URI through `MONGODB_URI`, with TLS, scoped database credentials, backups, and the host provider's network controls. Never commit the connection URI or credentials. The local helper is only needed for local development; an external MongoDB deployment is started and managed by its own provider.

Cloud setup must restore/start MongoDB for each new machine because running processes do not survive environment publication. A saved setup script should install dependencies and acquire the official image; startup instructions should run this helper before starting the application and verify database readiness again.
