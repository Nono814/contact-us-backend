#!/usr/bin/env python3
import os
import sys
import requests
import json

def call_claude(prompt, model="claude-3-5-sonnet-20241022"):
    """调用Claude API"""
    
    # 从环境变量获取API密钥
    api_key = os.getenv('ANTHROPIC_API_KEY')
    base_url = os.getenv('ANTHROPIC_BASE_URL', 'https://api.aicodemirror.com/api/claudecode')
    
    if not api_key:
        print("错误: 未设置 ANTHROPIC_API_KEY 环境变量")
        return None
    
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': api_key,
        'anthropic-version': '2023-06-01'
    }
    
    data = {
        'model': model,
        'max_tokens': 4000,
        'messages': [
            {
                'role': 'user',
                'content': prompt
            }
        ]
    }
    
    try:
        response = requests.post(f"{base_url}/v1/messages", headers=headers, json=data)
        response.raise_for_status()
        
        result = response.json()
        if 'content' in result and len(result['content']) > 0:
            return result['content'][0]['text']
        else:
            return "未收到有效响应"
            
    except requests.exceptions.RequestException as e:
        print(f"API调用错误: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"JSON解析错误: {e}")
        return None

def main():
    if len(sys.argv) < 2:
        print("使用方法: python claude_client.py '你的问题'")
        print("或者直接运行进行交互模式")
        print("输入 'quit' 退出")
        
        while True:
            try:
                user_input = input("\n🤖 Claude: 请输入你的问题: ")
                if user_input.lower() in ['quit', 'exit', '退出']:
                    break
                
                if user_input.strip():
                    print("\n🔄 正在思考...")
                    response = call_claude(user_input)
                    if response:
                        print(f"\n💡 Claude回答:\n{response}")
                    else:
                        print("❌ 获取回答失败")
                        
            except KeyboardInterrupt:
                print("\n\n👋 再见!")
                break
    else:
        # 命令行参数模式
        prompt = ' '.join(sys.argv[1:])
        response = call_claude(prompt)
        if response:
            print(response)
        else:
            print("获取回答失败")

if __name__ == "__main__":
    main() 