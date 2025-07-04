import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import './ApartmentDetail.css';
import api from '../api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const ApartmentDetail = () => {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();
    const [apartment, setApartment] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApartmentDetails = async () => {
            try {
                const response = await api.get(`/${id}/`);
                setApartment(response.data);
            } catch (err) {
                setError('Apartment not found');
            }
        };
    
        const fetchForecast = async () => {
            try {
                const response = await api.get(`/forecast/${id}/`);
                setForecast(response.data);
            } catch (err) {
                console.error('Error fetching forecast:', err);
            } finally {
                setLoading(false);
            }
        };
    
        fetchApartmentDetails();
        fetchForecast();
    }, [id]);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!apartment) return <div className="error">Apartment not found</div>;

    const chartData = {
        labels: forecast.map(item => item.year),
        datasets: [
            {
                label: 'Прогноз цены',
                data: forecast.map(item => item.price),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Прогноз цены (2026-2029)'
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                ticks: {
                    callback: function(value) {
                        return value.toLocaleString() + ' ₽';
                    }
                }
            }
        }
    };

    const AuthOverlay = () => (
        <div className="auth-overlay">
            <p>Для просмотра прогноза необходимо <Link to="/login">войти</Link> или <Link to="/register">зарегистрироваться</Link></p>
        </div>
    );

    return (
        <div className="apartment-detail">
            <div className="apartment-header">
                <h1>{apartment.title}</h1>
            </div>
            <div className="apartment-content-horizontal">
                <div className="apartment-image_detail">
                    {apartment.image ? (
                        <img
                            src={
                                apartment.image.startsWith('http')
                                    ? apartment.image
                                    : `http://localhost:81${apartment.image.startsWith('/') ? apartment.image : '/' + apartment.image}`
                            }
                            alt={apartment.title}
                        />
                    ) : (
                        <div className="no-image">No image available</div>
                    )}
                </div>
                <div className="apartment-info-block">
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="label">Площадь:</span>
                            <span className="value">{apartment.area} м²</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Комнат:</span>
                            <span className="value">{apartment.rooms}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Этаж:</span>
                            <span className="value">{apartment.floor}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Комплекс:</span>
                            <span className="value">{apartment.complex_name}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Адрес:</span>
                            <span className="value">{apartment.address}</span>
                        </div>
                        <div className="apartment-price">
                            <span className="label">Цена за м²:</span>
                            <span className="price-per-m2">{apartment.price_per_m2.toLocaleString()}₽/м²</span>
                            <span className="price">{apartment.price.toLocaleString()}₽</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="forecast-wide-block">
                <h2>Прогноз</h2>
                <div className="chart-container">
                    {!isAuthenticated && <AuthOverlay />}
                    <div className={!isAuthenticated ? 'blurred' : ''}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>
                <div className="forecast-table">
                    {!isAuthenticated && <AuthOverlay />}
                    <div className={!isAuthenticated ? 'blurred' : ''}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Год</th>
                                    <th>Цена за м²</th>
                                    <th>Цена</th>
                                </tr>
                            </thead>
                            <tbody>
                                {forecast.map((item) => (
                                    <tr key={item.year}>
                                        <td>{item.year}</td>
                                        <td>{item.price_per_m2.toLocaleString()} ₽/м²</td>
                                        <td>{item.price.toLocaleString()} ₽</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApartmentDetail; 