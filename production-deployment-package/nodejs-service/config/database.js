const mysql = require('mysql2/promise');

// 数据库连接配置（不指定数据库，用于创建数据库）
const baseConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 数据库连接配置（指定数据库）
const dbConfig = {
  ...baseConfig,
  database: process.env.DB_NAME
};

// 创建连接池
let pool;

// 初始化数据库连接
async function initDatabase() {
  try {
    // 首先尝试连接MySQL服务器（不指定数据库）
    const basePool = mysql.createPool(baseConfig);
    
    try {
      // 尝试创建数据库（如果不存在）
      await basePool.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
      console.log(`数据库 ${process.env.DB_NAME} 创建成功或已存在`);
    } catch (dbError) {
      console.error('创建数据库失败:', dbError);
    } finally {
      await basePool.end();
    }
    
    // 连接到指定数据库
    pool = mysql.createPool(dbConfig);
    
    // 测试连接
    const connection = await pool.getConnection();
    console.log('数据库连接成功');
    connection.release();
    
    // 创建数据库表（如果不存在）
    await createTables();
    
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
}

// 创建数据库表
async function createTables() {
  const tables = [
    // 招聘服务表
    `CREATE TABLE IF NOT EXISTS hiring_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      language VARCHAR(10) DEFAULT 'en' COMMENT '语言',
      name VARCHAR(100) NOT NULL COMMENT '联系人姓名',
      email VARCHAR(100) NOT NULL COMMENT '邮箱地址',
      company VARCHAR(100) COMMENT '公司名称',
      company_size VARCHAR(50) COMMENT '公司规模',
      role_type VARCHAR(50) COMMENT '职位类型',
      special_requirements TEXT COMMENT '特殊要求',
      ip_address VARCHAR(45) COMMENT 'IP地址',
      user_agent TEXT COMMENT '用户代理',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
      INDEX idx_email (email),
      INDEX idx_company (company),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='招聘服务提交记录表'`,
    
    // 雇主品牌服务表
    `CREATE TABLE IF NOT EXISTS employer_branding_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      language VARCHAR(10) DEFAULT 'en' COMMENT '语言',
      name VARCHAR(100) NOT NULL COMMENT '联系人姓名',
      email VARCHAR(100) NOT NULL COMMENT '邮箱地址',
      company_name VARCHAR(100) NOT NULL COMMENT '公司名称',
      company_size VARCHAR(50) COMMENT '公司规模',
      industry VARCHAR(50) COMMENT '行业',
      website VARCHAR(200) COMMENT '公司网站',
      additional_info TEXT COMMENT '附加信息/需求描述',
      ip_address VARCHAR(45) COMMENT 'IP地址',
      user_agent TEXT COMMENT '用户代理',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
      INDEX idx_email (email),
      INDEX idx_company_name (company_name),
      INDEX idx_industry (industry),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='雇主品牌服务提交记录表'`,
    
    // 人工数据服务表
    `CREATE TABLE IF NOT EXISTS human_data_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      language VARCHAR(10) DEFAULT 'en' COMMENT '语言',
      name VARCHAR(100) NOT NULL COMMENT '联系人姓名',
      email VARCHAR(100) NOT NULL COMMENT '邮箱地址',
      data_type VARCHAR(50) COMMENT '数据类型',
      expertise_area VARCHAR(50) COMMENT '专业领域',
      timeline VARCHAR(50) COMMENT '项目时间线',
      project_details TEXT COMMENT '项目详细描述',
      ip_address VARCHAR(45) COMMENT 'IP地址',
      user_agent TEXT COMMENT '用户代理',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
      INDEX idx_email (email),
      INDEX idx_data_type (data_type),
      INDEX idx_expertise_area (expertise_area),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人工数据服务提交记录表'`,
    
    // 数字克隆服务表
    `CREATE TABLE IF NOT EXISTS digital_clone_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      language VARCHAR(10) DEFAULT 'en' COMMENT '语言',
      name VARCHAR(100) NOT NULL COMMENT '联系人姓名',
      email VARCHAR(100) NOT NULL COMMENT '邮箱地址',
      expertise_field VARCHAR(50) COMMENT '专业领域',
      background TEXT COMMENT '个人背景描述',
      ip_address VARCHAR(45) COMMENT 'IP地址',
      user_agent TEXT COMMENT '用户代理',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
      INDEX idx_email (email),
      INDEX idx_expertise_field (expertise_field),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数字克隆服务提交记录表'`,
    
    // 其他咨询表
    `CREATE TABLE IF NOT EXISTS other_inquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      language VARCHAR(10) DEFAULT 'en' COMMENT '语言',
      name VARCHAR(100) NOT NULL COMMENT '联系人姓名',
      email VARCHAR(100) NOT NULL COMMENT '邮箱地址',
      company VARCHAR(100) COMMENT '公司名称',
      phone VARCHAR(20) COMMENT '手机号',
      message TEXT NOT NULL COMMENT '留言内容',
      ip_address VARCHAR(45) COMMENT 'IP地址',
      user_agent TEXT COMMENT '用户代理',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
      INDEX idx_email (email),
      INDEX idx_company (company),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='其他咨询提交记录表'`
  ];

  try {
    for (const table of tables) {
      await pool.execute(table);
    }
    console.log('数据库表创建完成');
  } catch (error) {
    console.error('创建数据库表失败:', error);
    throw error;
  }
}

// 获取数据库连接
function getConnection() {
  if (!pool) {
    throw new Error('数据库未初始化');
  }
  return pool;
}

// 执行查询
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('数据库查询错误:', error);
    throw error;
  }
}

// 执行事务
async function transaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  initDatabase,
  getConnection,
  query,
  transaction
}; 