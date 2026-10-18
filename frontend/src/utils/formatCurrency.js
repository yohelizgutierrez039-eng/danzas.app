const formatoPesos = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

// El backend devuelve el precio como texto (Decimal), por ejemplo "50000".
export const formatearPrecio = (valor) => {
  const numero = Number(valor);

  if (valor == null || valor === "" || !Number.isFinite(numero)) {
    return "-";
  }

  return formatoPesos.format(numero);
};
