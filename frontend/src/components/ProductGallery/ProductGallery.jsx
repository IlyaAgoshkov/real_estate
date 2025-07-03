import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ProductGallery.css';

function formatNumber(num) {
    return num.toLocaleString('ru-RU');
}

const ProductGallery = () => {
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const galleryRef = useRef(null);

    useEffect(() => {
        const fetchProfitableApartments = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Для просмотра популярных предложений необходимо войти.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('http://192.168.0.13:8000/apartments/api/profitable_apartments/', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {

                    if (response.status === 401) {
                        setError('Сессия истекла или пользователь не авторизован. Пожалуйста, войдите снова.');
                    } else {
                        setError(`HTTP error! status: ${response.status}`);
                    }
                    setLoading(false);
                    return;
                }
                const data = await response.json();
                setApartments(data);
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchProfitableApartments();
    }, []);

    const scrollLeft = () => {
        if (galleryRef.current) {
            galleryRef.current.scrollBy({
                left: -320,
                behavior: 'smooth'
            });
        }
    };

    const scrollRight = () => {
        if (galleryRef.current) {
            galleryRef.current.scrollBy({
                left: 320,
                behavior: 'smooth'
            });
        }
    };

    if (loading) {
        return <div className="product-gallery">Загрузка...</div>;
    }

    if (error) {
        return <div className="product-gallery">Ошибка: {error}</div>;
    }
    
    if (apartments.slice(1).length === 0) {
        return <div className="product-gallery">Нет популярных предложений.</div>;
    }

    return (
        <div className="product-gallery">
            <h2 className="gallery-title">Подобрали ЖК для вас</h2>
            <div className="gallery-grid" ref={galleryRef}>
                {apartments.slice(1).map(apartment => (
                    <Link to={`/apartments/${apartment.id}`} key={apartment.id} className="product-card">
                        <div className="product-image">
                            {apartment.image ? (
                                <img src={`http://192.168.0.13:8000${apartment.image}`} alt={apartment.title} />
                            ) : (
                                <div className="no-image">No image</div>
                            )}
                        </div>
                        <div className="product-info">
                            <div className="product-complex">{apartment.complex_name}</div>

                            <div className="product-details">
                                <span className="product-area-rooms">{apartment.area} м² {apartment.rooms} комн.</span>
                            </div>

                            <div className="product-price">{formatNumber(apartment.price)} ₽</div>

                            <div className="product-address">{apartment.address}</div>

                            {apartment.profit_percentage && (
                                <div className="product-profit">
                                    <span className="profit-label">Рост цены:</span>
                                    <span className="profit-value">
                                        +{apartment.profit_percentage.toFixed(1)}%
                                        {apartment.forecast_price_next_year && (
                                            <span className="forecast-price">
                                                ({formatNumber(Math.round(apartment.forecast_price_next_year * apartment.area))} ₽)
                                            </span>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            <button className="gallery-nav-button left" onClick={scrollLeft} aria-label="Scroll left">
                &#8249;
            </button>
            <button className="gallery-nav-button right" onClick={scrollRight} aria-label="Scroll right">
                &#8250;
            </button>

        </div>
    );
};

export default ProductGallery; 