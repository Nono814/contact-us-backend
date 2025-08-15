CREATE TABLE analytics_events (
event_id BINARY(16) NOT NULL,
version VARCHAR(8) NOT NULL,
event_name VARCHAR(64) NOT NULL,
rid BINARY(16) NOT NULL,
event_timestamp DATETIME(3) NOT NULL,
received_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

session_id BINARY(16) NULL,
user_id_hash CHAR(64) NULL,
is_logged_in TINYINT(1) NOT NULL DEFAULT 0,
language VARCHAR(8) NULL,

route_from VARCHAR(255) NULL,
route_to VARCHAR(255) NULL,

utm_source VARCHAR(64) NULL,
utm_medium VARCHAR(64) NULL,
utm_campaign VARCHAR(128) NULL,
utm_term VARCHAR(128) NULL,
utm_content VARCHAR(128) NULL,

device_ua TEXT NULL,
device_platform VARCHAR(32) NULL,
device_screen VARCHAR(32) NULL,
client_ip VARBINARY(16) NULL,
server_ip VARBINARY(16) NULL,

event_props JSON NULL,

-- 【修正部分】主键现在包含了分区键 `received_at`
PRIMARY KEY (event_id, received_at),

KEY idx_event_time (event_name, received_at),
KEY idx_rid_time (rid, received_at),
KEY idx_session_time (session_id, received_at),
KEY idx_user (user_id_hash),
KEY idx_route_to (route_to),

KEY idx_job_id ( (CAST(JSON_UNQUOTE(JSON_EXTRACT(event_props, '$.jobId')) AS CHAR(36))) ),
KEY idx_depth ( (CAST(JSON_EXTRACT(event_props, '$.depth') AS UNSIGNED)) )
)
PARTITION BY RANGE (TO_DAYS(received_at)) (
PARTITION p20250811 VALUES LESS THAN (TO_DAYS('2025-08-12')),
PARTITION pmax VALUES LESS THAN MAXVALUE
);

-- Demo预约表
CREATE TABLE demo_bookings (
  id VARCHAR(50) PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(100) NOT NULL,
  roles JSON NOT NULL,
  main_goal VARCHAR(50) NOT NULL,
  budget VARCHAR(50) NOT NULL,
  email_updates VARCHAR(10) NOT NULL,
  language VARCHAR(5) DEFAULT 'en',
  timestamp DATETIME(3) NOT NULL,
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  
  INDEX idx_email (email),
  INDEX idx_company (company),
  INDEX idx_timestamp (timestamp),
  INDEX idx_created_at (created_at)
);


