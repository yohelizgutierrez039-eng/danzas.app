export const formatearPrecio = (valor) => {
  const numero = Number(valor);

  if (
    valor === null ||
    valor === undefined ||
    valor === "" ||
    !Number.isFinite(numero)
  ) {
    return "-";
  }

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(numero);
};
