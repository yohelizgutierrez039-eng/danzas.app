// src/components/classes/ClassFilters.jsx

import Button from "../common/Button/Button";
import Select from "../common/Select/Select";

import "./ClassFilters.css";

const MODALIDAD_OPTIONS = [
  { value: "", label: "Todas" },
  { value: "presencial", label: "Presencial" },
];

/**
 * Panel de filtros de búsqueda de clases. Componente 100% controlado: no
 * maneja estado propio, delega cada cambio al padre vía `onChange`.
 *
 * @param {Object} props
 * @param {Object} props.filtros - { tipoBaile, ciudad, modalidad, precioMin, precioMax }
 * @param {(campo: string, valor: any) => void} props.onChange
 * @param {string[]} [props.tiposBaile]
 * @param {string[]} [props.ciudades]
 * @param {() => void} [props.onApply]
 */
function ClassFilters({
  filtros,
  onChange,
  tiposBaile = [],
  ciudades = [],
  onApply,
}) {
  const tipoBaileOptions = tiposBaile.map((tipo) => ({
    value: tipo,
    label: tipo,
  }));

  const ciudadOptions = ciudades.map((ciudad) => ({
    value: ciudad,
    label: ciudad,
  }));

  return (
    <div className="class-filters">
      <Select
        label="Tipo de baile"
        name="tipoBaile"
        value={filtros.tipoBaile}
        onChange={(e) => onChange("tipoBaile", e.target.value)}
        options={tipoBaileOptions}
        placeholder="Todos"
      />

      <Select
        label="Ciudad"
        name="ciudad"
        value={filtros.ciudad}
        onChange={(e) => onChange("ciudad", e.target.value)}
        options={ciudadOptions}
        placeholder="Todas"
      />

      <Select
        label="Modalidad"
        name="modalidad"
        value={filtros.modalidad}
        onChange={(e) => onChange("modalidad", e.target.value)}
        options={MODALIDAD_OPTIONS}
        placeholder=""
      />

      <div className="class-filters__price-row">
        <div className="class-filters__price-field">
          <label className="class-filters__label" htmlFor="precioMin">
            Desde
          </label>
          <input
            id="precioMin"
            type="number"
            className="class-filters__input"
            value={filtros.precioMin}
            onChange={(e) => onChange("precioMin", e.target.value)}
          />
        </div>

        <div className="class-filters__price-field">
          <label className="class-filters__label" htmlFor="precioMax">
            Hasta
          </label>
          <input
            id="precioMax"
            type="number"
            className="class-filters__input"
            value={filtros.precioMax}
            onChange={(e) => onChange("precioMax", e.target.value)}
          />
        </div>
      </div>

      <Button fullWidth onClick={() => onApply && onApply()}>
        Aplicar filtros
      </Button>
    </div>
  );
}

export default ClassFilters;
