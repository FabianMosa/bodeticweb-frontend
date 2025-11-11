import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import insumoService from '../services/insumo.service';
import proveedorService from '../services/proveedor.service';
import documentoService from '../services/documento.service';
import ScannerModal from '../components/ScannerModal.jsx';
import { useNotification } from '../context/NotificationContext';

// 1. Importar todos los componentes de Formulario
import { Container, Row, Col, Card, Form, Button, Spinner, InputGroup } from 'react-bootstrap';

// 2. Ya no necesitamos los objetos de estilo inline (formStyles, fieldsetStyles, etc.)

const InventarioCreatePage = () => {
  // --- Estados del Formulario ---
  const [formData, setFormData] = useState({
    nombre: '', sku: '', descripcion: '',
    stock_inicial: 0, stock_minimo: 1, id_categoria: '',
    fecha_vencimiento: '',
    id_proveedor: '',
    codigo_documento: '', 
    fecha_emision: new Date().toISOString().split('T')[0]
  });
  
  // --- Estados de Lógica ---
  const [idDocumentoExistente, setIdDocumentoExistente] = useState(null);
  const [docLoading, setDocLoading] = useState(false);
  const [docReadOnly, setDocReadOnly] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // Cargar desplegables (Categorías y Proveedores)
  useEffect(() => {
    const loadDropdowns = async () => {
      setLoadingDropdowns(true);
      try {
        const [categoriasData, proveedoresData] = await Promise.all([
          insumoService.getCategorias(),
          proveedorService.getProveedores()
        ]);
        
        setCategorias(categoriasData);
        setProveedores(proveedoresData);

        // Settear valores por defecto
        if (categoriasData.length > 0) {
          setFormData(f => ({ ...f, id_categoria: categoriasData[0].PK_id_categoria }));
        }
        if (proveedoresData.length > 0) {
          setFormData(f => ({ ...f, id_proveedor: proveedoresData[0].PK_id_proveedor }));
        }
      } catch (err) {
        showNotification(err.message || 'Error al cargar datos iniciales', 'error');
      } finally {
        setLoadingDropdowns(false);
      }
    };
    loadDropdowns();
  }, [showNotification]);

  // Handler genérico para inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'codigo_documento' && value === '') {
      resetDocumento();
    }
  };
  
  // Lógica para "Buscar o Crear Documento"
  const handleBuscarDocumento = async () => {
    if (!formData.codigo_documento) {
      showNotification('Ingrese un N° de Documento para buscar', 'error');
      return;
    }
    setDocLoading(true);
    try {
      const doc = await documentoService.getDocumentoByCodigo(formData.codigo_documento);
      if (doc) {
        showNotification(`Documento encontrado. Proveedor: ${doc.nombre_proveedor}`, 'success');
        setIdDocumentoExistente(doc.PK_id_documento);
        setFormData(prev => ({
          ...prev,
          id_proveedor: doc.FK_id_proveedor,
          fecha_emision: doc.fecha_emision.split('T')[0]
        }));
        setDocReadOnly(true);
      } else {
        showNotification('Documento no encontrado. Puede crear uno nuevo.', 'info');
        resetDocumento(true);
      }
    } catch (err) {
      showNotification(err.message || 'Error al buscar documento', 'error');
    } finally {
      setDocLoading(false);
    }
  };
  
  const resetDocumento = (mantenerCodigo = false) => {
    setIdDocumentoExistente(null);
    setDocReadOnly(false);
    setFormData(prev => ({
      ...prev,
      codigo_documento: mantenerCodigo ? prev.codigo_documento : '',
      id_proveedor: proveedores.length > 0 ? proveedores[0].PK_id_proveedor : '',
      fecha_emision: new Date().toISOString().split('T')[0]
    }));
  };

  // Lógica para el Escáner de SKU
  const handleScanSuccess = (skuScaneado) => {
    setFormData(prev => ({ ...prev, sku: skuScaneado }));
    setShowScanner(false);
  };

  // Lógica de Envío
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const dataParaApi = {
        nombre: formData.nombre,
        sku: formData.sku,
        descripcion: formData.descripcion,
        stock_inicial: formData.stock_inicial,
        stock_minimo: formData.stock_minimo,
        id_categoria: formData.id_categoria,
        fecha_vencimiento: formData.fecha_vencimiento || null,
        id_documento_existente: idDocumentoExistente,
        id_proveedor: formData.id_proveedor,
        codigo_documento: formData.codigo_documento,
        fecha_emision: formData.fecha_emision
      };

      await insumoService.createInsumo(dataParaApi); 
      showNotification('Insumo creado y asociado al documento con éxito', 'success');
      
      setFormData(prev => ({
        ...prev,
        nombre: '', sku: '', descripcion: '',
        stock_inicial: 0, stock_minimo: 1
      }));
      
    } catch (err) {
      showNotification(err.message || 'Error al crear el insumo', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  
  // 3. Usar un Spinner de Carga de Bootstrap
  if (loadingDropdowns) return (
    <Container fluid className="d-flex min-vh-100 justify-content-center align-items-center bg-light">
      <div className="text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando datos...</p>
      </div>
    </Container>
  );

  return (
    <Container fluid className="form-container bg-light min-vh-100 py-4">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8} xl={6}> 
          
          <Button variant="outline-primary" size="sm" as={Link} to="/inventario" className="mb-3">
            <i className="bi bi-arrow-left me-1"></i> Volver al Inventario
          </Button>
    
          <Card className="shadow-sm border-0">
            <Card.Header as="h2" className="text-center bg-primary fw-bold form-header">
              Ingreso Insumo 
            </Card.Header>
            <Card.Body className="p-4 p-md-5">
              
              {/* 4. Usar 100% Componentes React-Bootstrap (sin estilos inline) */}
              <Form onSubmit={handleSubmit}>
                
                {/* --- SECCIÓN DE DOCUMENTO --- */}
                <fieldset className="border p-3 rounded mb-4">
                  <legend className="fs-5 fw-semibold text-primary">1. Información de Ingreso (Factura/Guía)</legend>
                  
                  <Form.Group className="mb-3" controlId="formCodigoDoc">
                    <Form.Label>N° Documento (Factura/Guía):</Form.Label>
                    <InputGroup>
                      <Form.Control 
                        type="text" 
                        name="codigo_documento"
                        value={formData.codigo_documento}
                        onChange={handleChange} 
                        required 
                        className="form-control-focus"
                        readOnly={docReadOnly}
                      />
                      <Button 
                        variant={docReadOnly ? "outline-danger" : "outline-primary"}
                        onClick={docReadOnly ? resetDocumento : handleBuscarDocumento}
                        disabled={docLoading}
                        title={docReadOnly ? "Limpiar Documento" : "Buscar Documento"}
                      >
                        {docLoading ? <Spinner as="span" size="sm" animation="border" /> : 
                         docReadOnly ? <i className="bi bi-x-lg"></i> : <i className="bi bi-search"></i>}
                      </Button>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      Busque el N° de documento. Si no existe, complete los campos.
                    </Form.Text>
                  </Form.Group>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formProveedor">
                        <Form.Label>Proveedor:</Form.Label>
                        <Form.Select 
                          name="id_proveedor" 
                          onChange={handleChange} 
                          required 
                          value={formData.id_proveedor}
                          disabled={docReadOnly || proveedores.length === 0}
                          className="form-control-focus"
                        >
                          {proveedores.map(prov => (
                            <option key={prov.PK_id_proveedor} value={prov.PK_id_proveedor}>
                              {prov.nombre_proveedor}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formFechaEmision">
                        <Form.Label>Fecha Emisión:</Form.Label>
                        <Form.Control 
                          type="date" 
                          name="fecha_emision" 
                          value={formData.fecha_emision} 
                          onChange={handleChange} 
                          required 
                          readOnly={docReadOnly}
                          className="form-control-focus"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </fieldset>

                {/* --- SECCIÓN DE INSUMO --- */}
                <fieldset className="border p-3 rounded">
                  <legend className="fs-5 fw-semibold">2. Información del Insumo</legend>
                  
                  <Form.Group className="mb-3" controlId="formNombre">
                    <Form.Label>Nombre:</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="nombre" 
                      value={formData.nombre}
                      onChange={handleChange} 
                      required 
                      className="form-control-focus"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3" controlId="formSku">
                    <Form.Label>SKU (Código Barras)</Form.Label>
                    <InputGroup>
                      <Form.Control 
                        type="text" 
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange} 
                        required 
                        className="form-control-focus"
                      />
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => setShowScanner(true)}
                        title="Escanear Código"
                      >
                        <i className="bi bi-upc-scan"></i>
                      </Button>
                    </InputGroup>
                  </Form.Group> 
                          
                  <Form.Group className="mb-3" controlId="formCategoria">
                    <Form.Label>Categoría</Form.Label>
                    <Form.Select 
                      name="id_categoria" 
                      onChange={handleChange} 
                      required 
                      value={formData.id_categoria}
                      disabled={categorias.length === 0}
                      className="form-control-focus"
                    >
                      {categorias.map(cat => (
                        <option key={cat.PK_id_categoria} value={cat.PK_id_categoria}>
                          {cat.nombre_categoria}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  
                  <Row>
                    <Col xs={6}>
                      <Form.Group className="mb-3" controlId="formStockInicial">
                        <Form.Label>Stock Inicial</Form.Label>
                        <Form.Control 
                          type="number" 
                          name="stock_inicial" 
                          min="1" 
                          value={formData.stock_inicial}
                          onChange={handleChange} 
                          required 
                          className="form-control-focus"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={6}>
                      <Form.Group className="mb-3" controlId="formStockMinimo">
                        <Form.Label>Stock Mínimo</Form.Label>
                        <Form.Control 
                          type="number" 
                          name="stock_minimo" 
                          min="0" 
                          value={formData.stock_minimo}
                          onChange={handleChange} 
                          required 
                          className="form-control-focus"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3" controlId="formFechaVencimiento">
                    <Form.Label>Fecha Vencimiento (Opcional)</Form.Label>
                    <Form.Control 
                      type="date" 
                      name="fecha_vencimiento" 
                      value={formData.fecha_vencimiento}
                      onChange={handleChange} 
                      className="form-control-focus"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3" controlId="formDescripcion">
                    <Form.Label>Descripción (Opcional)</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={2} 
                      name="descripcion" 
                      value={formData.descripcion}
                      onChange={handleChange} 
                      className="form-control-focus"
                    />
                  </Form.Group>
                </fieldset>

                <div className="d-grid mt-4">
                  <Button 
                    variant="success"
                    type="submit" 
                    disabled={submitting || docLoading} 
                    size="lg"
                  >
                    {submitting ? (
                      <>
                        <Spinner as="span" size="sm" animation="border" /> Guardando...
                      </>
                    ) : 'Ingresar Insumo'}
                  </Button>
                </div>
              </Form>
              
              {/* RENDERIZAR EL MODAL DEL ESCÁNER */}
              {showScanner && (
                <ScannerModal 
                  onClose={() => setShowScanner(false)}
                  onScanSuccess={handleScanSuccess} 
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* --- Estilos CSS --- */}
      <style>{`
        .form-container {
          background-color: #f8f9fa;
        }
        .form-header { 
          background-color: #0d6efd; /* Azul primario */
          color: white;
          padding: 1.25rem;
        }
        .form-control-focus:focus {
          border-color: var(--bs-info);
          box-shadow: 0 0 0 0.25rem rgba(var(--bs-info-rgb), 0.25);
        }
        legend {
          font-size: 1.1rem;
          font-weight: 600;
        }
      `}</style>
    </Container>
  );
};

export default InventarioCreatePage;