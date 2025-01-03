import platform


class Fifo:
    socket_handle = None

    def __init__(self, path: str):
        if platform.system() == "Windows":
            import win32file

            self.socket_handle = win32file.CreateFile(path, win32file.GENERIC_READ,
                                                      0, None, win32file.OPEN_EXISTING, win32file.FILE_ATTRIBUTE_NORMAL, None)
        else:
            import socket

            self.socket_handle = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            self.socket_handle.connect(path)

    def recv(self, bufSize: int):
        if platform.system() == "Windows":
            import win32file

            result, data = win32file.ReadFile(self.socket_handle, bufSize)

            return data
        else:
            return self.socket_handle.recv(bufSize)
        
    def send_message(self, msg: str):
        if platform.system() == "Windows":
            import win32file

            win32file.WriteFile(self.socket_handle, bytes(msg, "utf-8"))
        else:
            self.socket_handle.send(bytes(msg, "utf-8"))