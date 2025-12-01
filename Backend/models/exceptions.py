class AuthException(Exception):
    """Lỗi cơ sở cho các vấn đề xác thực."""
    pass

class InvalidCredentialsException(AuthException):
    """Ném ra khi tên đăng nhập hoặc mật khẩu không chính xác."""
    def __init__(self, message="Sai tên đăng nhập hoặc mật khẩu"):
        self.message = message
        super().__init__(self.message)

class InactiveAccountException(AuthException):
    """Ném ra khi tài khoản người dùng bị vô hiệu hóa (is_active=False)."""
    def __init__(self, message="Tài khoản đã bị vô hiệu hóa"):
        self.message = message
        super().__init__(self.message)