process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "file:./test.db";
process.env.JWT_SECRET ??= "test-jwt-secret-min-16-chars";
process.env.JWT_EXPIRES_IN ??= "1h";
process.env.PORT ??= "0";
