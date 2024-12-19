import React, { useState, useRef } from 'react';

const ImageAdminForm = () => {
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null,
    link: '/SelectTickets'
  });

  const [preview, setPreview] = useState('');
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Crear un objeto de imagen con toda la información
    const newImage = {
      id: Date.now(), // Usar timestamp como ID único
      title: formData.title,
      description: formData.description,
      image: preview,
      link: formData.link
    };

    // Agregar la nueva imagen al estado de imágenes
    setImages(prevImages => [...prevImages, newImage]);

    // Guardar en localStorage para persistencia
    const storedImages = JSON.parse(localStorage.getItem('carouselImages') || '[]');
    const updatedImages = [...storedImages, newImage];
    localStorage.setItem('carouselImages', JSON.stringify(updatedImages));

    // Resetear formulario
    setFormData({
      title: '',
      description: '',
      image: null,
      link: '/SelectTickets'
    });
    setPreview('');
    
    // Resetear input de archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    alert('Imagen guardada exitosamente');
  };

  const removeImage = (id) => {
    const updatedImages = images.filter(img => img.id !== id);
    setImages(updatedImages);
    localStorage.setItem('carouselImages', JSON.stringify(updatedImages));
  };

  // Al montar el componente, cargar imágenes desde localStorage
  React.useEffect(() => {
    const storedImages = JSON.parse(localStorage.getItem('carouselImages') || '[]');
    setImages(storedImages);
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Administrador de Imágenes del Carousel</h2>
      
      {/* Formulario para agregar imagen */}
      <form onSubmit={handleSubmit} className="mx-auto max-w-lg">
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Título de la Promoción</label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">Descripción</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="link" className="form-label">Enlace de Redirección</label>
          <input
            type="text"
            className="form-control"
            id="link"
            name="link"
            value={formData.link}
            onChange={handleInputChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="image" className="form-label">Imagen</label>
          <input
            type="file"
            className="form-control"
            id="image"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </div>

        {preview && (
          <div className="mb-3">
            <label className="form-label">Vista previa:</label>
            <img
              src={preview}
              alt="Preview"
              className="img-fluid rounded"
              style={{ maxHeight: '200px' }}
            />
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary"
        >
          Guardar Imagen
        </button>
      </form>

      {/* Listado de imágenes guardadas */}
      <div className="mt-5">
        <h3>Imágenes Guardadas</h3>
        <div className="row">
          {images.map((img) => (
            <div key={img.id} className="col-md-4 mb-3">
              <div className="card">
                <img 
                  src={img.image} 
                  alt={img.title} 
                  className="card-img-top" 
                />
                <div className="card-body">
                  <h5 className="card-title">{img.title}</h5>
                  <p className="card-text">{img.description}</p>
                  <button 
                    className="btn btn-danger"
                    onClick={() => removeImage(img.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageAdminForm;