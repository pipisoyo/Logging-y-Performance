export const validarProducto = (productError) => {
    return `Error al regisgtrar el producto.
  Se esperaba el siguiente argumento:
  - ${productError.key}: de tipo ${typeof(productError.key)} - se recibio : "${productError.value}"`
};