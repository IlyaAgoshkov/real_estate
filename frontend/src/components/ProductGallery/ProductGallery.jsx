import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ProductGallery.css';
import api from '../../api';

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
            try {
                const response = await api.get('/profitable_apartments/');
                const data = Array.isArray(response.data)
                    ? response.data
                    : Array.isArray(response.data.results)
                        ? response.data.results
                        : [];

                setApartments(data);
                setLoading(false);
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 401) {
                        setError('Сессия истекла или пользователь не авторизован. Пожалуйста, войдите снова.');
                    } else {
                        setError(`HTTP error! status: ${error.response.status}`);
                    }
                } else {
                    setError(error.message);
                }
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

    if (!Array.isArray(apartments) || apartments.length <= 1) {
        return <div className="product-gallery">Нет популярных предложений.</div>;
    }

    return (
        <div className="product-gallery">
            <h2 className="gallery-title">Подобрали ЖК для вас</h2>
            <div className="gallery-grid" ref={galleryRef}>
                {apartments.slice(1).map(apartment => (
                    <Link to={`/apartments/${apartment.id}`} key={apartment.id} className="product-card">
                        <div className="product-image">
                            {apartment.image_url ? (
                                <img
                                    src={
                                        apartment.image_url.startsWith('http')
                                            ? apartment.image_url
                                            : `http://localhost:81${apartment.image_url.startsWith('/') ? apartment.image_url : '/' + apartment.image_url}`
                                    }
                                    alt={apartment.title}
                                />
                            ) : (
                                <div className="no-image">No image</div>
                            )}
                        </div>
                        <div className="product-info">
                            <div className="product-complex">{apartment.complex_name}</div>
                            <div className="product-details">
                                <span className="product-area-rooms">
                                    {apartment.area} м² {apartment.rooms} комн.
                                </span>
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
                                                (
                                                {formatNumber(
                                                    Math.round(apartment.forecast_price_next_year * apartment.area)
                                                )}{' '}
                                                ₽)
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
