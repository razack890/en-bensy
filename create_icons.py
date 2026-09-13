import os
from PIL import Image, ImageDraw

os.makedirs("icons", exist_ok=True)

def create_app_icon(size, filename, is_maskable=False):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    padding = size // 10 if is_maskable else 0
    box = [padding, padding, size - padding, size - padding]
    corner_radius = size // 4 if not is_maskable else size // 6
    
    base_color = (15, 23, 42, 255) # Slate 900
    accent_emerald = (16, 185, 129, 255) # Emerald 500
    accent_cyan = (6, 182, 212, 255) # Cyan 500
    
    draw.rounded_rectangle(box, radius=corner_radius, fill=base_color, outline=accent_emerald, width=max(2, size // 64))
    
    center = (size // 2, size // 2)
    radius = (size - 2 * padding) // 3
    
    glow_box = [center[0] - radius - size//16, center[1] - radius - size//16,
                center[0] + radius + size//16, center[1] + radius + size//16]
    draw.ellipse(glow_box, fill=(16, 185, 129, 40), outline=(6, 182, 212, 100), width=max(2, size//60))
    
    inner_box = [center[0] - radius, center[1] - radius,
                 center[0] + radius, center[1] + radius]
    draw.ellipse(inner_box, fill=(16, 185, 129, 200), outline=(52, 211, 153, 255), width=max(2, size//40))
    
    mic_w = size // 7
    mic_h = size // 3.8
    mic_x = center[0] - mic_w // 2
    mic_y = center[1] - mic_h // 1.5
    
    draw.rounded_rectangle([mic_x, mic_y, mic_x + mic_w, mic_y + mic_h], radius=mic_w//2, fill=(255, 255, 255, 255))
    
    cradle_top = mic_y + mic_h // 2.5
    cradle_w = mic_w * 1.7
    cradle_box = [center[0] - cradle_w // 2, cradle_top, center[0] + cradle_w // 2, cradle_top + mic_h * 0.8]
    draw.arc(cradle_box, start=0, end=180, fill=(255, 255, 255, 255), width=max(3, size // 45))
    
    stem_top = cradle_top + mic_h * 0.8
    stem_bottom = stem_top + size // 16
    draw.line([center[0], stem_top, center[0], stem_bottom], fill=(255, 255, 255, 255), width=max(3, size // 45))
    base_w = size // 6
    draw.line([center[0] - base_w // 2, stem_bottom, center[0] + base_w // 2, stem_bottom], fill=(255, 255, 255, 255), width=max(3, size // 45))

    img.save(filename, "PNG")
    print(f"Generated {filename} ({size}x{size})")

create_app_icon(192, "icons/icon-192.png")
create_app_icon(512, "icons/icon-512.png")
create_app_icon(512, "icons/icon-maskable.png", is_maskable=True)
create_app_icon(180, "icons/apple-touch-icon.png")
print("All icons created successfully.")
