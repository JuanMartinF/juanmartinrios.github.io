import pandas as pd
from pathlib import Path

# Rutas de entrada
catalogo_path = "catalogo_de_cuadrosD.csv"
template_path = "html/d01.html"
output_dir = Path("html")
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
        html = html.replace("Trilogía electromagnética I", nombre)
        html = html.replace("d01_web.jpg", f"{codigo}_web.jpg")
        html = html.replace("Trilogía electromagnética I", nombre)
        html = html.replace("Trilogía electromagnética I", nombre)
        html = html.replace("1.572€", str(precio))
        html = html.replace("3 de 36x28 cm", str(dimensiones))
        html = html.replace("d01", codigo)
        # Reemplazar la descripción (puede tener varios párrafos)
        # Vamos a poner todo en un solo <p>
        if "descripcion"!='':
            inicio = html.find('<div class="descripcion-cuadro">')
            fin = html.find('</div>', inicio)
            descripcion_html = f'<div class="descripcion-cuadro">\n      <p>{descripcion}</p>\n    </div>'
            html = html[:inicio] + descripcion_html + html[fin+6:]
        # Guardar archivo
        output_path = output_dir / f"{codigo}.html"
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(html)
        print("Archivo"+codigo+".html creado con exito")  

print("Archivos generados en la carpeta 'proyectos/proyectoD/html'")
