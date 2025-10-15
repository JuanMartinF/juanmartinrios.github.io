import pandas as pd
from pathlib import Path

# === TEMPLATE COMO CADENA DE TEXTO ===
html_template1 = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{titulo} - Juan Martín Ríos</title>
  <link rel="stylesheet" href="../../../style.css">
  <link rel="icon" href="../../../favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="../../../favicon.png">
  <style>
    .cuadro-detalle {{
      max-width: 900px;
      margin: 2rem auto;
      text-align: center;
    }}
    .cuadro-detalle img {{
      max-width: 100%;
      height: auto;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }}
    .info-cuadro {{
      margin-top: 1rem;
      font-size: 1.1rem;
    }}
    .descripcion-cuadro {{
      margin-top: 2rem;
      text-align: justify;
      line-height: 1.6;
    }}
  </style>
</head>

<body>
  <header>
    <div id="volver-atras" class="volver-atras">
      <button onclick="history.back()" aria-label="Volver atrás">←</button>
    </div>
    <script>
      if (window.history.length <= 1) {{
        document.getElementById("volver-atras").style.display = "none";
      }}
    </script>

    <h1><a href="../../../index.html" class="titulo-link">Galería de Juan Martín Ríos</a></h1>

    <button class="menu-toggle" aria-label="Abrir menú">&#9776;</button>
    <nav>
      <a href="../../../index.html">Inicio</a>
      <a href="../../../sobre.html">Sobre mí</a>
      <a href="../../../proyectos.html">Proyectos</a>
      <a href="../../../comprar.html">Comprar</a>
      <a href="../../../contacto.html">Contacto</a>
    </nav>
  </header>

  <main class="cuadro-detalle">
    <img src="../../../proyectos/{proj}/pics/{codigo}_web.jpg" alt="{titulo}" ondragstart="return false;" oncontextmenu="return false;">
    <div class="info-cuadro">
      <p><strong>Título:</strong> {titulo}</p>
      <p><strong>Precio:</strong> {precio}</p>
      <p><strong>Dimensiones:</strong> {dimensiones}</p>
      <p><strong>Código:</strong> {codigo}</p>
    </div>
    <div class="descripcion-cuadro">{descripcion}</div>
  </main>

  <div id="footer"></div>
  <script>
    fetch("../../../footer.html")
      .then(response => response.text())
      .then(data => document.getElementById("footer").innerHTML = data)
      .catch(err => console.error("Error al cargar el footer:", err));
  </script>
</body>
</html>
"""

html_template2 = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{titulo} - Juan Martín Ríos</title>
  <link rel="stylesheet" href="../../../style.css">
  <link rel="icon" href="../../../favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="../../../favicon.png">
  <style>
    .cuadro-detalle {{
      max-width: 900px;
      margin: 2rem auto;
      text-align: center;
    }}
    .cuadro-detalle img {{
      max-width: 100%;
      height: auto;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }}
    .info-cuadro {{
      margin-top: 1rem;
      font-size: 1.1rem;
    }}
    .descripcion-cuadro {{
      margin-top: 2rem;
      text-align: justify;
      line-height: 1.6;
    }}
  </style>
</head>

<body>
  <header>
    <div id="volver-atras" class="volver-atras">
      <button onclick="history.back()" aria-label="Volver atrás">←</button>
    </div>
    <script>
      if (window.history.length <= 1) {{
        document.getElementById("volver-atras").style.display = "none";
      }}
    </script>

    <h1><a href="../../../index.html" class="titulo-link">Galería de Juan Martín Ríos</a></h1>

    <button class="menu-toggle" aria-label="Abrir menú">&#9776;</button>
    <nav>
      <a href="../../../index.html">Inicio</a>
      <a href="../../../sobre.html">Sobre mí</a>
      <a href="../../../proyectos.html">Proyectos</a>
      <a href="../../../comprar.html">Comprar</a>
      <a href="../../../contacto.html">Contacto</a>
    </nav>
  </header>

  <main class="cuadro-detalle">
    <img src="../../../proyectos/{proj}/pics/{codigo}_web.jpg" alt="{titulo}" ondragstart="return false;" oncontextmenu="return false;">
    <div class="info-cuadro">
      <p><strong>Título:</strong> {titulo}</p>
      <p><strong>Dimensiones:</strong> {dimensiones}</p>
      <p><strong>Código:</strong> {codigo}</p>
    </div>
    <div class="descripcion-cuadro">{descripcion}</div>
  </main>

  <div id="footer"></div>
  <script>
    fetch("../../../footer.html")
      .then(response => response.text())
      .then(data => document.getElementById("footer").innerHTML = data)
      .catch(err => console.error("Error al cargar el footer:", err));
  </script>
</body>
</html>
"""


proyectos = ["proyectoA", "ProyectoB", "ProyectoC", "proyectoD", "proyectoF","proyectoG", "ProyectoH", "proyectoJ"]


for proj in proyectos:
    CSV_PATH = "proyectos/"+proj+"/"+proj+".csv"
    print(CSV_PATH)
    OUTPUT_DIR = Path("proyectos/"+proj+"/html") # carpeta donde se guardan los .html
    # === LECTURA DEL CSV ===
    df = pd.read_csv(CSV_PATH)
    # === GENERACIÓN DE ARCHIVOS HTML ===
    for _, row in df.iterrows():
        existing_html = row["Existing_html"]
        if existing_html == 'no':
            var_codigo = row["Codigo"]
            var_nombre = row["Nombre"]
            var_precio = row["Precio"]
            var_dimensiones = row["Dimensiones"]
            var_descripcion = row["descripcion"]
            var_venta = row["Venta"]
            if var_venta=="no":
                html_template = html_template2
            else:
                html_template = html_template1

            html = html_template.format(
                codigo=var_codigo,
                titulo=var_nombre,
                precio=var_precio,
                dimensiones=var_dimensiones,
                descripcion=var_descripcion,
                proj=proj
            )
            output_path = OUTPUT_DIR / f"{var_codigo}.html"
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(html)
            print(f"Generado: {output_path}")
