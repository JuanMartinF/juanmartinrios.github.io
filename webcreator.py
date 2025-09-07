import pandas as pd
from pathlib import Path

# Rutas de entrada
catalogo_path = "catalogo1.csv"
template_path = "wcuadros/cuadro1.html"
output_dir = Path("wcuadros")
output_dir.mkdir(exist_ok=True)

# Cargar catálogo
df = pd.read_csv(catalogo_path)

# Cargar plantilla
with open(template_path, "r", encoding="utf-8") as f:
    template = f.read()

# Generar un archivo HTML por cuadro
for _, row in df.iterrows():
    existing_html = row["Existing_html"]
    if existing_html == 'no':
        codigo = row["Codigo"]
        nombre = row["Nombre"]
        precio = row["Precio"]
        dimensiones = row["Dimensiones"]
        descripcion = row["descripcion"]
        # Crear contenido a partir de la plantilla
        html = template
        html = html.replace("Nombre del Cuadro 1", nombre)
        html = html.replace("cuadro1.jpg", f"{codigo}.jpg")
        html = html.replace("Cuadro 1", nombre)
        html = html.replace("Feynman diagrams", nombre)
        html = html.replace("1600 €", str(precio))
        html = html.replace("80 x 60 cm", str(dimensiones))
        # Reemplazar la descripción (puede tener varios párrafos)
        # Vamos a poner todo en un solo <p>
        inicio = html.find('<div class="descripcion-cuadro">')
        fin = html.find('</div>', inicio)
        descripcion_html = f'<div class="descripcion-cuadro">\n      <p>{descripcion}</p>\n    </div>'
        html = html[:inicio] + descripcion_html + html[fin+6:]
        # Guardar archivo
        output_path = output_dir / f"{codigo}.html"
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(html)
        print("Archivo"+codigo+".html creado con exito")  

print("Archivos generados en la carpeta 'wcuadros'")
