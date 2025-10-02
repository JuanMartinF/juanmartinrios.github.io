import pandas as pd
from pathlib import Path

# Rutas de entrada
catalogo_path = "proyectos/proyectoA/catalogo_de_cuadrosA.csv"
template_path = "proyectos/proyectoA/html/a003.html"
output_dir = Path("proyectos/proyectoA/html")
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
        html = html.replace("Paisaje cristalino", nombre)
        html = html.replace("a003_web.jpg", f"{codigo}_web.jpg")
        html = html.replace("Paisaje cristalino", nombre)
        html = html.replace("Paisaje cristalino", nombre)
        html = html.replace("896€", str(precio)+'€')
        html = html.replace("40x40", str(dimensiones))
        # Reemplazar la descripción (puede tener varios párrafos)
        # Vamos a poner todo en un solo <p>
#        inicio = html.find('<div class="descripcion-cuadro">')
 #       fin = html.find('</div>', inicio)
  #      descripcion_html = f'<div class="descripcion-cuadro">\n      <p>{descripcion}</p>\n    </div>'
   #     html = html[:inicio] + descripcion_html + html[fin+6:]
        # Guardar archivo
        output_path = output_dir / f"{codigo}.html"
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(html)
        print("Archivo"+codigo+".html creado con exito")  

print("Archivos generados en la carpeta 'proyectos/proyectoA/html/prueba'")
