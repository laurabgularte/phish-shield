import os
from PIL import Image, ImageDraw

def generate_placeholder_icons():
    sizes = [16, 48, 128]
    output_dir = "icons"

    # Cria a pasta /icons se ela não existir
    os.makedirs(output_dir, exist_ok=True)

    # Cor principal (Azul Segurança #1a73e8) e borda branca
    bg_color = (26, 115, 232, 255)
    border_color = (255, 255, 255, 255)

    for size in sizes:
        # Cria imagem RGBA
        img = Image.new("RGBA", (size, size), color=bg_color)
        draw = ImageDraw.Draw(img)

        # Desenha uma borda interna proporcional
        margin = max(1, size // 8)
        stroke_width = max(1, size // 16)
        
        draw.rectangle(
            [margin, margin, size - margin - 1, size - margin - 1],
            outline=border_color,
            width=stroke_width
        )

        filename = os.path.join(output_dir, f"icon{size}.png")
        img.save(filename, "PNG")
        print(f"✔ Gerado: {filename} ({size}x{size}px)")

if __name__ == "__main__":
    generate_placeholder_icons()