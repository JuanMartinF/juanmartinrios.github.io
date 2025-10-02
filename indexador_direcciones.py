import pandas as pd

# Cargar catálogo
df = pd.read_csv("proyectos/proyectoA/catalogo_de_cuadrosA.csv")

# Plantilla del bloque de tarjeta
template = """
<div class="card">
  <a href="https://themather314.github.io/juanmartinrios.github.io/proyectos/proyectoA/html/{codigo}.html">
    <img src="https://themather314.github.io/juanmartinrios.github.io/proyectos/proyectoA/pics/{codigo}_web.jpg" alt="{nombre}">
    <p class="title">{nombre}</p>
  </a>
</div>
"""

# Generar todos los bloques
bloques = []
for _, row in df.iterrows():
    existing = row["Existing_html"]
    if existing == 'no':
      codigo = row["Codigo"]
      nombre = row["Nombre"]
      bloques.append(template.format(codigo=codigo, nombre=nombre))

# Guardar en un archivo o mostrar en pantalla
with open("direcciones.html", "w", encoding="utf-8") as f:
    f.write("\n".join(bloques))

print(" Bloques generados en 'direcciones.html'")
