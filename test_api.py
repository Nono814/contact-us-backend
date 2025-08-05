#!/usr/bin/env python3
import requests
import json

API_BASE_URL = 'http://localhost:3001'

def test_health_check():
    """测试健康检查接口"""
    print("🏥 测试健康检查接口...")
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print("✅ 健康检查成功!")
            print(f"📋 响应数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
        else:
            print(f"❌ 健康检查失败，状态码: {response.status_code}")
    except Exception as e:
        print(f"❌ 健康检查错误: {e}")

def test_hiring_submission():
    """测试招聘服务提交"""
    print("\n🧪 测试招聘服务表单提交...")
    
    test_data = {
        "service": "hiring",
        "_language": "zh",
        "name": "李四",
        "email": "lisi@example.com",
        "company": "XYZ科技有限公司",
        "companySize": "201-500人",
        "roleType": "后端工程师",
        "specialRequirements": "需要熟悉Node.js和Python，有微服务架构经验"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/contact",
            headers={"Content-Type": "application/json"},
            json=test_data
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("✅ 招聘服务提交成功!")
                print(f"📋 响应数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
            else:
                print(f"❌ 招聘服务提交失败: {data.get('error')}")
        else:
            print(f"❌ 请求失败，状态码: {response.status_code}")
            print(f"响应内容: {response.text}")
    except Exception as e:
        print(f"❌ 网络错误: {e}")

def test_employer_branding_submission():
    """测试雇主品牌服务提交"""
    print("\n🏢 测试雇主品牌服务表单提交...")
    
    test_data = {
        "service": "employerBranding",
        "_language": "zh",
        "employerBranding_name": "王经理",
        "employerBranding_email": "hr@xyz.com",
        "employerBranding_companyName": "XYZ集团",
        "employerBranding_companySize": "500+",
        "industry": "互联网",
        "website": "https://www.xyz.com",
        "additionalInfo": "希望提升雇主品牌形象，吸引更多优秀人才加入"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/contact",
            headers={"Content-Type": "application/json"},
            json=test_data
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("✅ 雇主品牌服务提交成功!")
                print(f"📋 响应数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
            else:
                print(f"❌ 雇主品牌服务提交失败: {data.get('error')}")
        else:
            print(f"❌ 请求失败，状态码: {response.status_code}")
            print(f"响应内容: {response.text}")
    except Exception as e:
        print(f"❌ 网络错误: {e}")

def test_human_data_submission():
    """测试人工数据服务提交"""
    print("\n🤖 测试人工数据服务表单提交...")
    
    test_data = {
        "service": "humanData",
        "_language": "zh",
        "humanData_name": "张博士",
        "humanData_email": "zhang@ai-lab.com",
        "dataType": "文本标注",
        "expertiseArea": "自然语言处理",
        "timeline": "1-3个月",
        "projectDetails": "需要标注10万条中文语料，包括情感分析、实体识别等任务"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/contact",
            headers={"Content-Type": "application/json"},
            json=test_data
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("✅ 人工数据服务提交成功!")
                print(f"📋 响应数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
            else:
                print(f"❌ 人工数据服务提交失败: {data.get('error')}")
        else:
            print(f"❌ 请求失败，状态码: {response.status_code}")
            print(f"响应内容: {response.text}")
    except Exception as e:
        print(f"❌ 网络错误: {e}")

def test_invalid_submission():
    """测试无效提交"""
    print("\n🚫 测试无效提交...")
    
    # 测试缺少必填字段
    invalid_data = {
        "service": "hiring",
        "_language": "zh",
        "company": "测试公司"
        # 缺少name和email
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/contact",
            headers={"Content-Type": "application/json"},
            json=invalid_data
        )
        
        if response.status_code == 500:
            data = response.json()
            print("✅ 无效提交被正确拒绝!")
            print(f"📋 错误信息: {data.get('error')}")
        else:
            print(f"❌ 期望500错误，但得到状态码: {response.status_code}")
    except Exception as e:
        print(f"❌ 测试错误: {e}")

def main():
    """主函数"""
    print("🚀 开始API测试...\n")
    
    test_health_check()
    test_hiring_submission()
    test_employer_branding_submission()
    test_human_data_submission()
    test_invalid_submission()
    
    print("\n✨ 测试完成!")

if __name__ == "__main__":
    main() 