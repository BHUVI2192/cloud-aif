import os
from PIL import Image, ImageDraw

def generate_round_icon(src_img, size):
    # Create round crop
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size, size), fill=255)
    
    resized = src_img.resize((size, size), Image.Resampling.LANCZOS)
    round_img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    round_img.paste(resized, (0, 0), mask=mask)
    return round_img

def main():
    workspace_dir = "/home/bhuvan/Downloads/cloud-aif-shivamogga/cloud-aif"
    src_path = os.path.join(workspace_dir, "public", "logo_512.png")
    
    if not os.path.exists(src_path):
        print(f"Source logo not found at {src_path}")
        return
        
    src_img = Image.open(src_path)
    
    # 1. iOS AppIcon Generation
    ios_dest = os.path.join(workspace_dir, "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png")
    ios_dir = os.path.dirname(ios_dest)
    if os.path.exists(ios_dir):
        # Resize to 1024x1024
        ios_img = src_img.resize((1024, 1024), Image.Resampling.LANCZOS)
        # Convert to RGB if it has alpha channel (since iOS store icons should be flat RGB without alpha transparency)
        if ios_img.mode == 'RGBA':
            background = Image.new('RGB', ios_img.size, (255, 255, 255))
            background.paste(ios_img, mask=ios_img.split()[3])
            ios_img = background
        ios_img.save(ios_dest, "PNG")
        print(f"Generated iOS AppIcon at {ios_dest}")
    else:
        print("iOS asset directory not found, skipping iOS AppIcon.")

    # 2. Android mipmap Icons Generation
    android_res_dir = os.path.join(workspace_dir, "android/app/src/main/res")
    if os.path.exists(android_res_dir):
        android_sizes = {
            "mipmap-mdpi": 48,
            "mipmap-hdpi": 72,
            "mipmap-xhdpi": 96,
            "mipmap-xxhdpi": 144,
            "mipmap-xxxhdpi": 192
        }
        
        for folder, size in android_sizes.items():
            folder_path = os.path.join(android_res_dir, folder)
            os.makedirs(folder_path, exist_ok=True)
            
            # Standard square icon
            launcher_dest = os.path.join(folder_path, "ic_launcher.png")
            square_img = src_img.resize((size, size), Image.Resampling.LANCZOS)
            square_img.save(launcher_dest, "PNG")
            
            # Round icon
            round_dest = os.path.join(folder_path, "ic_launcher_round.png")
            round_img = generate_round_icon(src_img, size)
            round_img.save(round_dest, "PNG")
            
            print(f"Generated Android icons ({size}x{size}) in {folder}")
    else:
        print("Android resource directory not found, skipping Android icons.")

if __name__ == "__main__":
    main()
