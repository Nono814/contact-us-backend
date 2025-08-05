from http.server import BaseHTTPRequestHandler, HTTPServer

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html; charset=utf-8")
        self.end_headers()
        
        # 获取客户端IP地址
        client_ip = self.client_address[0]
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>我的公网服务器</title>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; background-color: #f0f0f0; }}
                .container {{ background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                h1 {{ color: #333; }}
                .info {{ background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 欢迎访问我的公网服务器！</h1>
                <div class="info">
                    <p><strong>服务器时间:</strong> {self.date_time_string()}</p>
                    <p><strong>客户端IP:</strong> {client_ip}</p>
                    <p><strong>请求路径:</strong> {self.path}</p>
                </div>
                <p>这是一个运行在公网环境的Python HTTP服务器。</p>
            </div>
        </body>
        </html>
        """
        
        self.wfile.write(html_content.encode('utf-8'))

def run(server_class=HTTPServer, handler_class=SimpleHTTPRequestHandler):
    # 监听所有网络接口，包括公网
    server_address = ('0.0.0.0', 8081)
    httpd = server_class(server_address, handler_class)
    print(f"服务器启动在 http://0.0.0.0:8081")
    print("按 Ctrl+C 停止服务器")
    httpd.serve_forever()

if __name__ == "__main__":
    run()