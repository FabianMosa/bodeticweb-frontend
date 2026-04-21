import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Table,
  Card,
  Spinner,
  Form,
  Pagination,
  InputGroup,
  Badge,
  Modal,
} from "react-bootstrap";
import {
  Plus,
  ScanLine,
  Search,
  MapPin,
  Edit,
  Trash2,
  RotateCcw,
  LogOut,
  ArrowLeft,
  Save,
  Crosshair,
  EyeOff,
  Package,
} from "lucide-react";

import insumoService from "../services/insumo.service";
import SalidaModal from "../components/SalidaModal";
import ScannerModal from "../components/ScannerModal";
import LocationPicker from "../components/LocationPicker"; // Importamos el componente reutilizable
import { useNotification } from "../context/NotificationContext";

/** Formatea fecha de insumo (API: Date MySQL, string o ISO) para lectura en UI. */
const formatearFechaInsumo = (valor) => {
  if (valor == null || valor === "") return null;
  try {
    let d;
    if (valor instanceof Date) d = valor;
    else {
      const s = String(valor);
      d = new Date(s.includes("T") ? s : `${s.slice(0, 10)}T12:00:00`);
    }
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("es-CL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return null;
  }
};

const InventarioPage = () => {
  // --- Estados de Aplicación ---
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuarioRol, setUsuarioRol] = useState(null);
  const [categorias, setCategorias] = useState([]);

  // --- Estados de Filtros ---
  const [filtroActivo, setFiltroActivo] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // --- Paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // --- Modales ---
  const [salidaModalOpen, setSalidaModalOpen] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState(null);

  // --- Estados Específicos para Edición de Ubicación ---
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newCoords, setNewCoords] = useState(null);
  const [savingLocation, setSavingLocation] = useState(false);

  // Detalle rápido al hacer clic en la fila (GET /insumos/:id para descripción y más campos)
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [detalleInsumo, setDetalleInsumo] = useState(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const detalleFetchId = useRef(0);

  const { showNotification } = useNotification();

  // --- Carga Inicial ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (categorias.length === 0) {
          const categoriasData = await insumoService.getCategorias();
          setCategorias(categoriasData);
        }
        const filtros = {
          activo: filtroActivo,
          categoria: filtroCategoria,
          search: filtroNombre,
        };
        const response = await insumoService.getInsumos(
          filtros,
          currentPage,
          ITEMS_PER_PAGE
        );
        setInsumos(response.data);
        setTotalPages(response.pagination.totalPages);
      } catch (err) {
        showNotification(err.message || "Error al cargar datos", "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
    const usuarioInfo = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioInfo) setUsuarioRol(usuarioInfo.usuario.rol);
  }, [
    filtroActivo,
    filtroCategoria,
    filtroNombre,
    currentPage,
    categorias.length,
    showNotification,
  ]);

  // --- Handlers Generales ---
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFiltroNombre(searchTerm);
    setCurrentPage(1);
  };

  const handleToggleActivo = async (insumo) => {
    const nuevoEstado = !insumo.activo;
    if (
      window.confirm(
        `¿${nuevoEstado ? "Habilitar" : "Deshabilitar"} el insumo "${
          insumo.nombre
        }"?`
      )
    ) {
      try {
        await insumoService.toggleActivo(insumo.PK_id_insumo, nuevoEstado);
        setInsumos((prev) =>
          prev.map((i) =>
            i.PK_id_insumo === insumo.PK_id_insumo
              ? { ...i, activo: nuevoEstado }
              : i
          )
        );
        showNotification(
          `Insumo ${nuevoEstado ? "habilitado" : "deshabilitado"}`,
          "success"
        );
      } catch (err) {
        showNotification(err.message || "Error al cambiar estado", "error");
      }
    }
  };

  /**
   * Retira el insumo de la aplicación (ya no aparece en papelera ni escáner).
   * La fila y los movimientos siguen en la base de datos para trazabilidad.
   */
  const handleRetirarDeApp = async (insumo) => {
    if (
      !window.confirm(
        `«${insumo.nombre}» dejará de mostrarse en la aplicación (inventario, escáner y alertas). ` +
          "Los registros en base de datos y el historial de movimientos se conservan. ¿Continuar?"
      )
    ) {
      return;
    }
    try {
      await insumoService.ocultarDeApp(insumo.PK_id_insumo);
      setInsumos((prev) =>
        prev.filter((i) => i.PK_id_insumo !== insumo.PK_id_insumo)
      );
      showNotification(
        "Insumo retirado de la aplicación. Los datos permanecen para trazabilidad.",
        "success"
      );
    } catch (err) {
      const msg =
        typeof err === "string"
          ? err
          : err?.message || "No se pudo retirar el insumo de la aplicación";
      showNotification(msg, "error");
    }
  };

  // --- Lógica Modal Ubicación ---
  const handleOpenLocationModal = (insumo) => {
    setSelectedInsumo(insumo);
    // Reiniciar estados de edición
    setIsEditingLocation(false);
    setNewImageFile(null);
    setNewCoords({
      x: insumo.coordenada_x || 50,
      y: insumo.coordenada_y || 50,
    });
    setLocationModalOpen(true);
  };

  const handleSaveLocation = async () => {
    if (!selectedInsumo) return;
    setSavingLocation(true);
    try {
      if (typeof insumoService.updateUbicacion !== "function") {
        throw new Error(
          "Falta implementar updateUbicacion en insumo.service.js"
        );
      }

      const formData = new FormData();
      // Si newCoords es null (no se tocó), usar las actuales del insumo
      const coordsToSend = newCoords || {
        x: selectedInsumo.coordenada_x,
        y: selectedInsumo.coordenada_y,
      };

      formData.append("coordenada_x", coordsToSend.x);
      formData.append("coordenada_y", coordsToSend.y);

      if (newImageFile) {
        formData.append("imagen_ubicacion", newImageFile);
      }

      const response = await insumoService.updateUbicacion(
        selectedInsumo.PK_id_insumo,
        formData
      );

      // Actualizar tabla localmente
      setInsumos((prev) =>
        prev.map((i) =>
          i.PK_id_insumo === selectedInsumo.PK_id_insumo
            ? {
                ...i,
                imagen_ubicacion:
                  response.imagen_ubicacion || i.imagen_ubicacion, // Fallback si backend no devuelve URL
                coordenada_x: coordsToSend.x,
                coordenada_y: coordsToSend.y,
              }
            : i
        )
      );

      showNotification("Ubicación actualizada correctamente", "success");
      setLocationModalOpen(false);
    } catch (err) {
      console.error(err);
      showNotification(err.message || "Error al guardar ubicación", "error");
    } finally {
      setSavingLocation(false);
    }
  };

  /**
   * Abre el modal de detalle y completa datos con la API (descripción, vencimiento, etc.).
   * La fila de la tabla sigue mostrando categoría; se fusiona aquí para no perder el nombre.
   */
  const handleOpenDetalle = async (filaLista) => {
    const reqId = ++detalleFetchId.current;
    setDetalleModalOpen(true);
    setDetalleLoading(true);
    setDetalleInsumo(null);
    try {
      const full = await insumoService.getInsumoById(filaLista.PK_id_insumo);
      if (reqId !== detalleFetchId.current) return;
      setDetalleInsumo({
        ...full,
        nombre_categoria: filaLista.nombre_categoria,
      });
    } catch (err) {
      if (reqId !== detalleFetchId.current) return;
      const msg =
        typeof err === "string"
          ? err
          : err?.message || "No se pudo cargar el detalle del insumo";
      showNotification(msg, "error");
      setDetalleModalOpen(false);
    } finally {
      if (reqId === detalleFetchId.current) setDetalleLoading(false);
    }
  };

  const handleCerrarDetalle = () => {
    setDetalleModalOpen(false);
    setDetalleInsumo(null);
    setDetalleLoading(false);
  };

  /** Cierra el detalle y abre el modal de ubicación con el mismo insumo (evita dos modales superpuestos). */
  const abrirUbicacionDesdeDetalle = () => {
    if (!detalleInsumo) return;
    const insumoParaMapa = { ...detalleInsumo };
    handleCerrarDetalle();
    handleOpenLocationModal(insumoParaMapa);
  };

  const handleScanSuccess = async (sku) => {
    setScannerModalOpen(false);
    try {
      const insumo = await insumoService.getInsumoBySku(sku);
      if (insumo) {
        setSelectedInsumo(insumo);
        setSalidaModalOpen(true);
      } else {
        showNotification(`SKU "${sku}" no encontrado`, "error");
      }
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  return (
    <Container fluid className="page-container min-vh-100 py-4 font-sans">
      {/* Header */}
      <Row className="mb-4 align-items-center">
        <Col xs="auto">
          <Button
            variant="outline-secondary"
            size="lg"
            as={Link}
            to="/dashboard"
            className="me-3"
          >
            <ArrowLeft size={24} />
          </Button>
        </Col>
        <Col>
          <h2 className="fw-bold text-dark m-0">Gestión de Inventario</h2>
          <p className="text-muted small mb-0">
            Control de insumos y materiales
          </p>
        </Col>
        <Col xs="auto" className="d-flex gap-2">
          {usuarioRol === 1 && (
            <Button
              variant="success"
              as={Link}
              to="/inventario/nuevo"
              className="shadow-sm rounded-pill px-3 d-flex align-items-center gap-2"
            >
              <Plus size={18} />{" "}
              <span className="d-none d-md-inline">Nuevo Insumo</span>
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() => setScannerModalOpen(true)}
            className="shadow-sm rounded-pill px-3 d-flex align-items-center gap-2"
          >
            <ScanLine size={18} />{" "}
            <span className="d-none d-md-inline">Escanear</span>
          </Button>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="shadow-sm border-0 mb-4 rounded-4">
        <Card.Body className="p-4">
          <Form onSubmit={handleSearchSubmit}>
            <Row className="g-3 align-items-end">
              <Col xs={12} lg={5}>
                <Form.Label className="small fw-bold text-secondary text-uppercase">
                  Buscador
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0 text-muted">
                    <Search size={16} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Nombre o SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0 shadow-none"
                  />
                  <Button variant="outline-primary" type="submit">
                    Buscar
                  </Button>
                </InputGroup>
              </Col>
              <Col xs={12} md={6} lg={3}>
                <Form.Label className="small fw-bold text-secondary text-uppercase">
                  Categoría
                </Form.Label>
                <Form.Select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  disabled={categorias.length === 0}
                  className="shadow-none"
                >
                  <option value="">Todas</option>
                  {categorias.map((cat) => (
                    <option
                      key={cat.PK_id_categoria}
                      value={cat.PK_id_categoria}
                    >
                      {cat.nombre_categoria}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={12} md={6} lg={4}>
                <div className="bg-light rounded p-1 border d-flex">
                  <Button
                    variant={filtroActivo ? "white" : "light"}
                    className={`flex-grow-1 border-0 small fw-bold ${
                      filtroActivo
                        ? "shadow-sm text-primary bg-white"
                        : "text-muted"
                    }`}
                    onClick={() => {
                      setFiltroActivo(true);
                      setCurrentPage(1);
                    }}
                  >
                    Activos
                  </Button>
                  <Button
                    variant={!filtroActivo ? "white" : "light"}
                    className={`flex-grow-1 border-0 small fw-bold ${
                      !filtroActivo
                        ? "shadow-sm text-danger bg-white"
                        : "text-muted"
                    }`}
                    onClick={() => {
                      setFiltroActivo(false);
                      setCurrentPage(1);
                    }}
                  >
                    Papelera
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Tabla */}
      <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Table hover responsive="md" className="align-middle mb-0 custom-table">
              <thead className="bg-light text-secondary text-uppercase small fw-bold">
                <tr>
                  <th className="py-3 ps-4">Insumo</th>
                  <th className="py-3 text-center">Stock</th>
                  <th className="py-3 align-center">Categoría</th>
                  <th className="py-3 pe-4 text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {insumos.length > 0 ? (
                  insumos.map((insumo) => (
                    <tr
                      key={insumo.PK_id_insumo}
                      className={`border-bottom cursor-pointer ${
                        !insumo.activo ? "bg-light opacity-50" : ""
                      }`}
                      onClick={() => handleOpenDetalle(insumo)}
                      title="Ver detalle del insumo"
                    >
                      <td className="ps-4">
                        <div className="fw-bold text-dark">{insumo.nombre}</div>
                        <div className="small text-muted font-monospace">
                          SKU: {insumo.sku}
                        </div>
                      </td>
                      <td className="text-center">
                        <h5
                          className={`m-0 fw-bold ${
                            insumo.stock_actual <= insumo.stock_minimo &&
                            insumo.activo
                              ? "text-danger"
                              : "text-dark"
                          }`}
                        >
                          {insumo.stock_actual}
                        </h5>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {!!insumo.activo && (
                            <Button
                              variant="link"
                              className="btn-icon-sm p-0 text-primary rounded-circle bg-primary-subtle"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenLocationModal(insumo);
                              }}
                              title="Ver/Editar ubicación física"
                            >
                              <MapPin size={14} />
                            </Button>
                          )}
                          <Badge
                            bg="light"
                            text="dark"
                            className="border fw-normal px-2 py-1"
                          >
                            {insumo.nombre_categoria}
                          </Badge>
                        </div>
                      </td>

                      <td
                        className="pe-4 text-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="d-flex justify-content-end align-items-center gap-1 flex-wrap">
                          {usuarioRol === 1 && (
                            <>
                              <Button
                                variant="light"
                                size="sm"
                                className="btn-icon border text-warning"
                                as={Link}
                                to={`/inventario/editar/${insumo.PK_id_insumo}`}
                              >
                                <Edit size={16} />
                              </Button>
                              <Button
                                variant="light"
                                size="sm"
                                className="btn-icon border"
                                onClick={() => handleToggleActivo(insumo)}
                              >
                                {insumo.activo ? (
                                  <Trash2 size={16} className="text-danger" />
                                ) : (
                                  <RotateCcw
                                    size={16}
                                    className="text-success"
                                  />
                                )}
                              </Button>
                              {/* Solo en papelera: quitar de la UI sin borrar en BD */}
                              {!insumo.activo && (
                                <Button
                                  variant="light"
                                  size="sm"
                                  className="btn-icon border text-secondary"
                                  title="Retirar de la aplicación (conserva historial en BD)"
                                  onClick={() => handleRetirarDeApp(insumo)}
                                >
                                  <EyeOff size={16} />
                                </Button>
                              )}
                            </>
                          )}
                          {!!insumo.activo && (
                            <Button
                              variant="primary"
                              size="sm"
                              className="d-flex align-items-center ms-2 px-3 gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInsumo(insumo);
                                setSalidaModalOpen(true);
                              }}
                              disabled={insumo.stock_actual === 0}
                            >
                              <LogOut size={16} /> Salida
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-5 text-muted">
                      No se encontraron insumos.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center py-3 border-top">
              <Pagination className="mb-0">
                <Pagination.First
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                />
                <Pagination.Item active>{currentPage}</Pagination.Item>
                <Pagination.Next
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modales Auxiliares */}
      {salidaModalOpen && (
        <SalidaModal
          insumo={selectedInsumo}
          onClose={() => setSalidaModalOpen(false)}
          onSuccess={(id, s) =>
            setInsumos((prev) =>
              prev.map((i) =>
                i.PK_id_insumo === id ? { ...i, stock_actual: s } : i
              )
            )
          }
        />
      )}
      {scannerModalOpen && (
        <ScannerModal
          onClose={() => setScannerModalOpen(false)}
          onScanSuccess={handleScanSuccess}
        />
      )}

      {/* Modal flotante: detalle del insumo al hacer clic en la fila (datos completos vía API) */}
      <Modal
        show={detalleModalOpen}
        onHide={handleCerrarDetalle}
        centered
        scrollable
        size="lg"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5 d-flex align-items-center gap-2">
            <Package className="text-primary" size={22} aria-hidden />
            Detalle del insumo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {detalleLoading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-muted small mt-2 mb-0">Cargando información…</p>
            </div>
          )}
          {!detalleLoading && detalleInsumo && (
            <>
              <div className="text-center mb-4 px-1">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary mb-3 insumo-detalle-icon-wrap">
                  <Package size={28} strokeWidth={1.75} aria-hidden />
                </div>
                <h5 className="fw-bold mb-1">{detalleInsumo.nombre}</h5>
                {detalleInsumo.descripcion ? (
                  <p className="text-muted small mb-0 text-start">
                    {detalleInsumo.descripcion}
                  </p>
                ) : (
                  <p className="text-muted small mb-0 fst-italic">
                    Sin descripción registrada
                  </p>
                )}
              </div>

              <div className="bg-light rounded-3 p-3 mb-3">
                <Row className="g-3">
                  <Col xs={12} sm={6}>
                    <small className="text-muted d-block text-uppercase fw-semibold ls-1">
                      SKU
                    </small>
                    <span className="font-monospace fw-semibold">
                      {detalleInsumo.sku}
                    </span>
                  </Col>
                  <Col xs={12} sm={6}>
                    <small className="text-muted d-block text-uppercase fw-semibold ls-1">
                      Categoría
                    </small>
                    <span className="fw-semibold">
                      {detalleInsumo.nombre_categoria ?? "—"}
                    </span>
                  </Col>
                  <Col xs={12} sm={6}>
                    <small className="text-muted d-block text-uppercase fw-semibold ls-1">
                      Nro. documento (Factura/guía)
                    </small>
                    <span className="fw-semibold">
                      {detalleInsumo.codigo_documento ?? "Sin documento"}
                    </span>
                  </Col>
                  <Col xs={6}>
                    <small className="text-muted d-block text-uppercase fw-semibold ls-1">
                      Stock actual
                    </small>
                    <span
                      className={`fs-5 fw-bold ${
                        detalleInsumo.activo &&
                        detalleInsumo.stock_actual <=
                          detalleInsumo.stock_minimo
                          ? "text-danger"
                          : "text-dark"
                      }`}
                    >
                      {detalleInsumo.stock_actual}
                    </span>
                  </Col>
                  <Col xs={6}>
                    <small className="text-muted d-block text-uppercase fw-semibold ls-1">
                      Stock mínimo
                    </small>
                    <span className="fs-6 fw-semibold">
                      {detalleInsumo.stock_minimo}
                    </span>
                  </Col>
                  <Col xs={12} sm={6}>
                    <small className="text-muted d-block text-uppercase fw-semibold ls-1">
                      Vencimiento
                    </small>
                    <span className="fw-semibold">
                      {formatearFechaInsumo(detalleInsumo.fecha_vencimiento) ??
                        "Sin fecha"}
                    </span>
                  </Col>
                  <Col xs={12} sm={6}>
                    <small className="text-muted d-block text-uppercase fw-semibold ls-1">
                      Estado
                    </small>
                    {detalleInsumo.activo ? (
                      <Badge bg="success">Activo</Badge>
                    ) : (
                      <Badge bg="secondary">En papelera</Badge>
                    )}
                  </Col>
                </Row>
              </div>

              {detalleInsumo.imagen_ubicacion && (
                <div className="rounded-3 overflow-hidden border bg-dark mb-3 insumo-detalle-thumb">
                  <img
                    src={detalleInsumo.imagen_ubicacion}
                    alt=""
                    className="insumo-detalle-thumb-img"
                  />
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
          <div className="d-flex flex-wrap gap-2">
            {!detalleLoading && detalleInsumo?.activo && (
              <Button
                variant="outline-primary"
                className="rounded-pill d-flex align-items-center gap-2"
                onClick={abrirUbicacionDesdeDetalle}
              >
                <MapPin size={18} />
                Ubicación en bodega
              </Button>
            )}
            {usuarioRol === 1 && detalleInsumo && !detalleLoading && (
              <Button
                variant="outline-warning"
                className="rounded-pill"
                as={Link}
                to={`/inventario/editar/${detalleInsumo.PK_id_insumo}`}
                onClick={handleCerrarDetalle}
              >
                <Edit size={16} className="me-1" />
                Editar
              </Button>
            )}
          </div>
          <Button
            variant="secondary"
            className="rounded-pill ms-sm-auto"
            onClick={handleCerrarDetalle}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL DE UBICACIÓN (Usando LocationPicker) */}
      <Modal
        show={locationModalOpen}
        onHide={() => setLocationModalOpen(false)}
        centered
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold d-flex align-items-center gap-2">
            {isEditingLocation ? (
              <>
                <Crosshair size={20} className="text-danger" /> Definir
                Ubicación
              </>
            ) : (
              <>
                <MapPin size={20} className="text-primary" /> Ubicación en
                Bodega
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center bg-light">
          {selectedInsumo && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 text-dark fw-bold">
                  {selectedInsumo.nombre}
                </h5>
                {!isEditingLocation && usuarioRol === 1 && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setIsEditingLocation(true)}
                    className="d-flex align-items-center gap-2"
                  >
                    <Edit size={16} /> Modificar
                  </Button>
                )}
              </div>

              {isEditingLocation ? (
                // MODO EDICIÓN: Usamos el LocationPicker
                <LocationPicker
                  initialImage={selectedInsumo.imagen_ubicacion}
                  initialCoords={{
                    x: selectedInsumo.coordenada_x,
                    y: selectedInsumo.coordenada_y,
                  }}
                  onImageSelect={setNewImageFile}
                  onLocationSelect={setNewCoords}
                />
              ) : (
                // MODO VISUALIZACIÓN (clases en global.css)
                <div className="position-relative bg-dark rounded-3 overflow-hidden shadow-inner border location-preview-container">
                  {selectedInsumo.imagen_ubicacion ? (
                    <div className="position-relative w-100 h-100">
                      <img
                        src={selectedInsumo.imagen_ubicacion}
                        alt="Ubicación"
                        className="img-fluid w-100"
                      />
                      <div
                        className="location-marker-pin"
                        style={{
                          left: `${selectedInsumo.coordenada_x || 50}%`,
                          top: `${selectedInsumo.coordenada_y || 50}%`,
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center py-5 h-100 text-white-50">
                      <MapPin size={48} className="mb-3 opacity-50" />
                      <p>Sin imagen de ubicación.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {isEditingLocation ? (
            <>
              <Button
                variant="light"
                onClick={() => setIsEditingLocation(false)}
                disabled={savingLocation}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveLocation}
                disabled={savingLocation}
                className="d-flex align-items-center gap-2"
              >
                {savingLocation ? (
                  <Spinner size="sm" animation="border" />
                ) : (
                  <Save size={18} />
                )}{" "}
                Guardar
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setLocationModalOpen(false)}
            >
              Cerrar
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InventarioPage;
