const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// 获取所有联系表单提交记录
router.get('/contacts', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      service, 
      startDate, 
      endDate 
    } = req.query;

    const offset = (page - 1) * limit;
    const pageSize = parseInt(limit);

    // 简化的查询逻辑
    let data = [];
    let total = 0;

    if (service) {
      // 如果指定了服务类型，只查询该服务
      let tableName;
      switch (service) {
        case 'hiring': tableName = 'hiring_submissions'; break;
        case 'employerBranding': tableName = 'employer_branding_submissions'; break;
        case 'humanData': tableName = 'human_data_submissions'; break;
        case 'digitalClone': tableName = 'digital_clone_submissions'; break;
        case 'other': tableName = 'other_inquiries'; break;
        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid service type'
          });
      }
      
      // 获取总数
      const countResult = await query(`SELECT COUNT(*) as count FROM ${tableName}`);
      total = countResult[0].count;
      
      // 获取数据
      data = await query(`SELECT * FROM ${tableName} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [pageSize, offset]);
      
      // 添加服务类型标识
      data = data.map(item => ({ ...item, service_type: service }));
    } else {
      // 如果没有指定服务类型，获取所有服务的记录
      const hiringData = await query('SELECT * FROM hiring_submissions ORDER BY created_at DESC LIMIT ? OFFSET ?', [pageSize, offset]);
      const employerBrandingData = await query('SELECT * FROM employer_branding_submissions ORDER BY created_at DESC LIMIT ? OFFSET ?', [pageSize, offset]);
      const humanDataData = await query('SELECT * FROM human_data_submissions ORDER BY created_at DESC LIMIT ? OFFSET ?', [pageSize, offset]);
      const digitalCloneData = await query('SELECT * FROM digital_clone_submissions ORDER BY created_at DESC LIMIT ? OFFSET ?', [pageSize, offset]);
      const otherData = await query('SELECT * FROM other_inquiries ORDER BY created_at DESC LIMIT ? OFFSET ?', [pageSize, offset]);
      
      // 获取总数
      const hiringCount = await query('SELECT COUNT(*) as count FROM hiring_submissions');
      const employerBrandingCount = await query('SELECT COUNT(*) as count FROM employer_branding_submissions');
      const humanDataCount = await query('SELECT COUNT(*) as count FROM human_data_submissions');
      const digitalCloneCount = await query('SELECT COUNT(*) as count FROM digital_clone_submissions');
      const otherCount = await query('SELECT COUNT(*) as count FROM other_inquiries');
      
      total = hiringCount[0].count + employerBrandingCount[0].count + humanDataCount[0].count + 
              digitalCloneCount[0].count + otherCount[0].count;
      
      // 合并数据并添加服务类型标识
      data = [
        ...hiringData.map(item => ({ ...item, service_type: 'hiring' })),
        ...employerBrandingData.map(item => ({ ...item, service_type: 'employerBranding' })),
        ...humanDataData.map(item => ({ ...item, service_type: 'humanData' })),
        ...digitalCloneData.map(item => ({ ...item, service_type: 'digitalClone' })),
        ...otherData.map(item => ({ ...item, service_type: 'other' }))
      ];
      
      // 按时间排序
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      data = data.slice(0, pageSize);
    }

    // 计算分页信息
    const totalPages = Math.ceil(total / pageSize);

    res.json({
      success: true,
      data: data,
      pagination: {
        total: total,
        page: parseInt(page),
        limit: pageSize,
        totalPages: totalPages
      }
    });

  } catch (error) {
    console.error('获取联系记录错误:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch contact records'
    });
  }
});

// 获取特定服务的详细记录
router.get('/contacts/:service/:id', async (req, res) => {
  try {
    const { service, id } = req.params;

    let sql;
    let tableName;

    switch (service) {
      case 'hiring':
        tableName = 'hiring_submissions';
        sql = 'SELECT * FROM hiring_submissions WHERE id = ?';
        break;
      case 'employerBranding':
        tableName = 'employer_branding_submissions';
        sql = 'SELECT * FROM employer_branding_submissions WHERE id = ?';
        break;
      case 'humanData':
        tableName = 'human_data_submissions';
        sql = 'SELECT * FROM human_data_submissions WHERE id = ?';
        break;
      case 'digitalClone':
        tableName = 'digital_clone_submissions';
        sql = 'SELECT * FROM digital_clone_submissions WHERE id = ?';
        break;
      case 'other':
        tableName = 'other_inquiries';
        sql = 'SELECT * FROM other_inquiries WHERE id = ?';
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid service type'
        });
    }

    const result = await query(sql, [id]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }

    res.json({
      success: true,
      data: result[0]
    });

  } catch (error) {
    console.error('获取详细记录错误:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch record details'
    });
  }
});

// 删除记录
router.delete('/contacts/:service/:id', async (req, res) => {
  try {
    const { service, id } = req.params;

    let sql;
    let tableName;

    switch (service) {
      case 'hiring':
        tableName = 'hiring_submissions';
        sql = 'DELETE FROM hiring_submissions WHERE id = ?';
        break;
      case 'employerBranding':
        tableName = 'employer_branding_submissions';
        sql = 'DELETE FROM employer_branding_submissions WHERE id = ?';
        break;
      case 'humanData':
        tableName = 'human_data_submissions';
        sql = 'DELETE FROM human_data_submissions WHERE id = ?';
        break;
      case 'digitalClone':
        tableName = 'digital_clone_submissions';
        sql = 'DELETE FROM digital_clone_submissions WHERE id = ?';
        break;
      case 'other':
        tableName = 'other_inquiries';
        sql = 'DELETE FROM other_inquiries WHERE id = ?';
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid service type'
        });
    }

    const result = await query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }

    res.json({
      success: true,
      message: 'Record deleted successfully'
    });

  } catch (error) {
    console.error('删除记录错误:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete record'
    });
  }
});

// 获取统计信息
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let whereConditions = [];
    let queryParams = [];

    if (startDate) {
      whereConditions.push('created_at >= ?');
      queryParams.push(startDate + ' 00:00:00');
    }

    if (endDate) {
      whereConditions.push('created_at <= ?');
      queryParams.push(endDate + ' 23:59:59');
    }

    const whereClause = whereConditions.length > 0 ? ' WHERE ' + whereConditions.join(' AND ') : '';

    // 各服务类型的统计
    const hiringCount = await query(`SELECT COUNT(*) as count FROM hiring_submissions${whereClause}`, queryParams);
    const employerBrandingCount = await query(`SELECT COUNT(*) as count FROM employer_branding_submissions${whereClause}`, queryParams);
    const humanDataCount = await query(`SELECT COUNT(*) as count FROM human_data_submissions${whereClause}`, queryParams);
    const digitalCloneCount = await query(`SELECT COUNT(*) as count FROM digital_clone_submissions${whereClause}`, queryParams);
    const otherCount = await query(`SELECT COUNT(*) as count FROM other_inquiries${whereClause}`, queryParams);

    const stats = [
      { service_type: 'hiring', count: hiringCount[0].count },
      { service_type: 'employerBranding', count: employerBrandingCount[0].count },
      { service_type: 'humanData', count: humanDataCount[0].count },
      { service_type: 'digitalClone', count: digitalCloneCount[0].count },
      { service_type: 'other', count: otherCount[0].count }
    ];

    const total = hiringCount[0].count + employerBrandingCount[0].count + humanDataCount[0].count + 
                  digitalCloneCount[0].count + otherCount[0].count;

    res.json({
      success: true,
      data: {
        total: total,
        byService: stats
      }
    });

  } catch (error) {
    console.error('获取统计信息错误:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router; 