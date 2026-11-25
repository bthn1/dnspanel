import ctypes
import os
import subprocess
import threading
import time

import keyboard
import pystray
from PIL import Image, ImageDraw

APP_NAME = "DoubleWindows"
DOUBLE_PRESS_SECONDS = 0.45
_last_press = {"windows": 0.0, "shift": 0.0}
_lock = threading.Lock()


def create_icon():
    image = Image.new("RGBA", (64, 64), (19, 25, 42, 255))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((7, 7, 57, 57), radius=13, fill=(39, 112, 235, 255))
    draw.rounded_rectangle((18, 29, 46, 35), radius=3, fill="white")
    draw.rounded_rectangle((29, 18, 35, 46), radius=3, fill="white")
    return image


def open_windows_settings():
    try:
        os.startfile("ms-settings:")
    except Exception:
        subprocess.Popen(["cmd", "/c", "start", "", "ms-settings:"], shell=False)


def toggle_caps_lock():
    user32 = ctypes.windll.user32
    user32.keybd_event(0x14, 0x3A, 0, 0)
    user32.keybd_event(0x14, 0x3A, 0x0002, 0)


def on_key_event(event):
    if event.event_type != keyboard.KEY_DOWN:
        return
    key = (event.name or "").lower()
    now = time.monotonic()
    if key in ("windows", "left windows", "win"):
        slot = "windows"
    elif key in ("left shift", "shift"):
        slot = "shift"
    else:
        return
    with _lock:
        previous = _last_press[slot]
        _last_press[slot] = now
        double_press = bool(previous and now - previous <= DOUBLE_PRESS_SECONDS)
        if double_press:
            _last_press[slot] = 0.0
    if double_press:
        action = open_windows_settings if slot == "windows" else toggle_caps_lock
        threading.Thread(target=action, daemon=True).start()


def quit_app(icon, item):
    keyboard.unhook_all()
    icon.stop()


def main():
    icon = pystray.Icon(
        APP_NAME,
        create_icon(),
        "DoubleWindows çalışıyor",
        menu=pystray.Menu(
            pystray.MenuItem("Windows Ayarlarını Aç", lambda icon, item: open_windows_settings()),
            pystray.MenuItem("Çıkış", quit_app),
        ),
    )
    keyboard.hook(on_key_event)
    icon.run()


if __name__ == "__main__":
    main()
