import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';
import ProductGallery from './ProductGallery/ProductGallery';
import { FaFilter } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import './ApartmentList.css';
import api from '../api';

const ROOM_OPTIONS = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3+', value: 3 }
];

const COMPLEXES = [
    '', 'Режиссёр', 'Небо', 'AVrorA', 'URAL', 'Смородина', 'Зеленодар', 'The Grand Palace', 'Novella'
];

const DEFAULTS = {
    priceRange: [0, 30000000],
    areaRange: [0, 200],
    floorRange: [1, 30],
    rooms: '',
    complex: ''
};

function formatNumber(num) {
    return num.toLocaleString('ru-RU');
}

function getPageNumbers(current, total) {
    const delta = 2;
    const pages = [];
    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
        pages.push(i);
    }
    return pages;
}

function ApartmentList() {
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [pending, setPending] = useState({
        priceRange: [...DEFAULTS.priceRange],
        areaRange: [...DEFAULTS.areaRange],
        floorRange: [...DEFAULTS.floorRange],
        rooms: '',
        complex: ''
    });
    const [applied, setApplied] = useState({
        priceRange: [...DEFAULTS.priceRange],
        areaRange: [...DEFAULTS.areaRange],
        floorRange: [...DEFAULTS.floorRange],
        rooms: '',
        complex: ''
    });
    const pageSize = 12;
 
    const [countLoading, setCountLoading] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    useEffect(() => {
        setCountLoading(true);
        const queryParams = new URLSearchParams({
            min_price: pending.priceRange[0],
            max_price: pending.priceRange[1],
            min_area: pending.areaRange[0],
            max_area: pending.areaRange[1],
            min_floor: pending.floorRange[0],
            max_floor: pending.floorRange[1],
            rooms: pending.rooms === '' ? '' : pending.rooms,
            complex_name: pending.complex
        });
        api.get(`/?${queryParams}`)
            .then(response => {
                setPendingCount(response.data.count || 0);
                setCountLoading(false);
            })
            .catch(() => setCountLoading(false));
    }, [pending]);

    useEffect(() => {
        setLoading(true);
        const queryParams = new URLSearchParams({
            page,
            page_size: pageSize,
            min_price: applied.priceRange[0],
            max_price: applied.priceRange[1],
            min_area: applied.areaRange[0],
            max_area: applied.areaRange[1],
            min_floor: applied.floorRange[0],
            max_floor: applied.floorRange[1],
            rooms: applied.rooms === '' ? '' : applied.rooms,
            complex_name: applied.complex
        });
        api.get(`/?${queryParams}`)
            .then(response => {
                setApartments(response.data.results);
                setTotal(response.data.count);
                setLoading(false);
            })
            .catch(e => {
                setError(e.message);
                setLoading(false);
            });
    }, [applied, page]);

    const handleSlider = (name) => (_, value) => setPending(prev => ({ ...prev, [name]: value }));
    const handleRooms = (value) => setPending(prev => ({ ...prev, rooms: value }));
    const handleComplex = (e) => setPending(prev => ({ ...prev, complex: e.target.value }));

    const toggleFilter = () => {
        setIsFilterOpen(!isFilterOpen);
    };

    const handleApply = () => {
        setApplied({ ...pending });
        setPage(1);
        setIsFilterOpen(false);
    };

    const handleReset = () => {
        setPending({
            priceRange: [...DEFAULTS.priceRange],
            areaRange: [...DEFAULTS.areaRange],
            floorRange: [...DEFAULTS.floorRange],
            rooms: '',
            complex: ''
        });
        setApplied({
            priceRange: [...DEFAULTS.priceRange],
            areaRange: [...DEFAULTS.areaRange],
            floorRange: [...DEFAULTS.floorRange],
            rooms: '',
            complex: ''
        });
        setPage(1);
    };

    useEffect(() => {
        const container = document.getElementById('product-gallery-container');
        if (container) {
            // productGallery.render(container);
        }
    }, []);

    if (error) return <div className="error">{error}</div>;

    return (
        <div className="apartment-list">
            
            <ProductGallery />
            
            <button className="filter-mobile-trigger" onClick={toggleFilter}>
                <FaFilter />
                Фильтры
            </button>
            <header className="app-header">
                <h1>Доступные квартиры</h1>
            </header>

            <div className={`filter-drawer ${isFilterOpen ? 'open' : ''}`}>
                <div className="filter-drawer-header">
                    <h2 className="filter-drawer-title">Фильтры</h2>
                    <button className="filter-drawer-close" onClick={toggleFilter}>
                        <IoClose />
                    </button>
                </div>
                <div className="filter-drawer-content">
                    <Box className="mui-filters">
                        <div className="mui-filters-row">
                            <div className="mui-filter-col">
                                <div className="mui-filter-label">Выбрать жилой комплекс</div>
                                <FormControl fullWidth>
                                    <Select
                                        value={pending.complex}
                                        onChange={handleComplex}
                                        sx={{ background: '#fff', borderRadius: 2 }}
                                    >
                                        <MenuItem value="">Любой</MenuItem>
                                        {COMPLEXES.filter(c => c).map(c => (
                                            <MenuItem key={c} value={c}>{c}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                            <div className="mui-filter-col">
                                <div className="mui-filter-label">Комнатность</div>
                                <ButtonGroup variant="outlined" aria-label="rooms" sx={{ gap: 1 }}>
                                    {ROOM_OPTIONS.map(opt => (
                                        <Button
                                            key={opt.value}
                                            variant={pending.rooms === opt.value ? 'contained' : 'outlined'}
                                            onClick={() => handleRooms(opt.value)}
                                            sx={{ borderRadius: '50%', minWidth: 48, minHeight: 48 }}
                                        >
                                            {opt.label}
                                        </Button>
                                    ))}
                                </ButtonGroup>
                            </div>
                            <div className="mui-filter-col">
                                <div className="mui-filter-label">Стоимость, ₽</div>
                                <Box sx={{ px: 2 }}>
                                    <Slider
                                        value={pending.priceRange}
                                        onChange={handleSlider('priceRange')}
                                        min={DEFAULTS.priceRange[0]}
                                        max={DEFAULTS.priceRange[1]}
                                        step={10000}
                                        valueLabelDisplay="off"
                                        sx={{ color: '#ff5a1f' }}
                                    />
                                    <div className="mui-slider-values">
                                        <span>{formatNumber(pending.priceRange[0])}</span>
                                        <span>{formatNumber(pending.priceRange[1])}</span>
                                    </div>
                                </Box>
                            </div>
                        </div>
                        <div className="mui-filters-row">
                            <div className="mui-filter-col">
                                <div className="mui-filter-label">Площадь, м²</div>
                                <Box sx={{ px: 2 }}>
                                    <Slider
                                        value={pending.areaRange}
                                        onChange={handleSlider('areaRange')}
                                        min={DEFAULTS.areaRange[0]}
                                        max={DEFAULTS.areaRange[1]}
                                        step={1}
                                        valueLabelDisplay="off"
                                        sx={{ color: '#ff5a1f' }}
                                    />
                                    <div className="mui-slider-values">
                                        <span>{pending.areaRange[0]}</span>
                                        <span>{pending.areaRange[1]}</span>
                                    </div>
                                </Box>
                            </div>
                            <div className="mui-filter-col">
                                <div className="mui-filter-label">Этаж</div>
                                <Box sx={{ px: 2 }}>
                                    <Slider
                                        value={pending.floorRange}
                                        onChange={handleSlider('floorRange')}
                                        min={DEFAULTS.floorRange[0]}
                                        max={DEFAULTS.floorRange[1]}
                                        step={1}
                                        valueLabelDisplay="off"
                                        sx={{ color: '#ff5a1f' }}
                                    />
                                    <div className="mui-slider-values">
                                        <span>{pending.floorRange[0]}</span>
                                        <span>{pending.floorRange[1]}</span>
                                    </div>
                                </Box>
                            </div>
                        </div>
                    </Box>
                </div>
                <div className="filter-drawer-footer">
                    <button className="reset-btn" onClick={handleReset}>
                        Сбросить
                    </button>
                    <button 
                        className="apply-btn" 
                        onClick={handleApply}
                        disabled={countLoading}
                    >
                        {countLoading ? <CircularProgress size={24} color="inherit" /> : `Показать ${pendingCount} квартир${pendingCount === 1 ? 'у' : ''}`}
                    </button>
                </div>
            </div>


            <Box className="mui-filters" sx={{ background: '#fff', borderRadius: 2, p: 3, mb: 4, boxShadow: 1 }}>
                <div className="mui-filters-row">
                    <div className="mui-filter-col">
                        <div className="mui-filter-label">Выбрать жилой комплекс</div>
                        <FormControl fullWidth>
                            <Select
                                value={pending.complex}
                                onChange={handleComplex}
                                sx={{ background: '#fff', borderRadius: 2 }}
                            >
                                <MenuItem value="">Любой</MenuItem>
                                {COMPLEXES.filter(c => c).map(c => (
                                    <MenuItem key={c} value={c}>{c}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <div className="mui-filter-col">
                        <div className="mui-filter-label">Комнатность</div>
                        <ButtonGroup variant="outlined" aria-label="rooms" sx={{ gap: 1 }}>
                            {ROOM_OPTIONS.map(opt => (
                                <Button
                                    key={opt.value}
                                    variant={pending.rooms === opt.value ? 'contained' : 'outlined'}
                                    onClick={() => handleRooms(opt.value)}
                                    sx={{ borderRadius: '50%', minWidth: 48, minHeight: 48 }}
                                >
                                    {opt.label}
                                </Button>
                            ))}
                        </ButtonGroup>
                    </div>
                    <div className="mui-filter-col">
                        <div className="mui-filter-label">Стоимость, ₽</div>
                        <Box sx={{ px: 2 }}>
                            <Slider
                                value={pending.priceRange}
                                onChange={handleSlider('priceRange')}
                                min={DEFAULTS.priceRange[0]}
                                max={DEFAULTS.priceRange[1]}
                                step={10000}
                                valueLabelDisplay="off"
                                sx={{ color: '#ff5a1f' }}
                            />
                            <div className="mui-slider-values">
                                <span>{formatNumber(pending.priceRange[0])}</span>
                                <span>{formatNumber(pending.priceRange[1])}</span>
                            </div>
                        </Box>
                    </div>
                </div>
                <div className="mui-filters-row">
                    <div className="mui-filter-col">
                        <div className="mui-filter-label">Площадь, м²</div>
                        <Box sx={{ px: 2 }}>
                            <Slider
                                value={pending.areaRange}
                                onChange={handleSlider('areaRange')}
                                min={DEFAULTS.areaRange[0]}
                                max={DEFAULTS.areaRange[1]}
                                step={1}
                                valueLabelDisplay="off"
                                sx={{ color: '#ff5a1f' }}
                            />
                            <div className="mui-slider-values">
                                <span>{pending.areaRange[0]}</span>
                                <span>{pending.areaRange[1]}</span>
                            </div>
                        </Box>
                    </div>
                    <div className="mui-filter-col">
                        <div className="mui-filter-label">Этаж</div>
                        <Box sx={{ px: 2 }}>
                            <Slider
                                value={pending.floorRange}
                                onChange={handleSlider('floorRange')}
                                min={DEFAULTS.floorRange[0]}
                                max={DEFAULTS.floorRange[1]}
                                step={1}
                                valueLabelDisplay="off"
                                sx={{ color: '#ff5a1f' }}
                            />
                            <div className="mui-slider-values">
                                <span>{pending.floorRange[0]}</span>
                                <span>{pending.floorRange[1]}</span>
                            </div>
                        </Box>
                    </div>
                    <div className="mui-filter-col mui-filter-actions" style={{ alignItems: 'flex-end', justifyContent: 'flex-end', gap: '1.2rem'}}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2, color: 'grey'}}>
                            <Button onClick={handleReset} variant="text" color="inherit" sx={{ textTransform: 'none', color: 'black' }}>
                                Очистить фильтр
                            </Button>
                        </Box>
                        <Button
                            onClick={handleApply}
                            variant="contained"
                            color="warning"
                            sx={{ fontWeight: 600, fontSize: '1.1rem', borderRadius: 2, px: 4, py: 1.5, boxShadow: '0 2px 8px rgba(255,90,31,0.08)' }}
                            disabled={countLoading}
                        >
                            {countLoading ? <CircularProgress size={24} color="inherit" /> : `Показать ${pendingCount} квартир${pendingCount === 1 ? 'у' : ''}`}
                        </Button>
                    </div>
                </div>
            </Box>

            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <>
                    <div className="apartments-grid">
                        {apartments.map(apartment => (
                            <Link to={`/apartments/${apartment.id}`} key={apartment.id} className="apartment-card">
                                <div className="apartment-image-container">
                                    {apartment.image ? (
                                        <img src={apartment.image.startsWith('http') ? apartment.image : `http://192.168.0.44:80${apartment.image}`} alt={apartment.title} className="apartment-image" />
                                    ) : (
                                        <div className="no-image">No image</div>
                                    )}
                                </div>
                                <div className="apartment-info">
                                    <div className="apartment-complex">{apartment.complex_name}</div>
                                    <div className="apartment-title-block">
                                        <span className="apartment-title">{apartment.title}</span>
                                        <span className="apartment-area">{apartment.area} м²</span>
                                    </div>
                                    <div className="apartment-meta">
                                        Этаж {apartment.floor}
                                    </div>
                                    <hr className="apartment-divider" />
                                    <div className="apartment-price-block">
                                                <span className="apartment-price">{formatNumber(apartment.price)} ₽</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="pagination">
                        <button
                            onClick={() => setPage(1)}
                            disabled={page === 1}
                            className="pagination-btn"
                            title="Первая"
                        >
                            &#171;
                        </button>
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="pagination-btn"
                            title="Назад"
                        >
                            &#8592;
                        </button>
                        {getPageNumbers(page, Math.ceil(total / pageSize)).map(num => (
                            <button
                                key={num}
                                onClick={() => setPage(num)}
                                className={`pagination-btn${num === page ? ' active' : ''}`}
                                disabled={num === page}
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === Math.ceil(total / pageSize)}
                            className="pagination-btn"
                            title="Вперёд"
                        >
                            &#8594;
                        </button>
                        <button
                            onClick={() => setPage(Math.ceil(total / pageSize))}
                            disabled={page === Math.ceil(total / pageSize)}
                            className="pagination-btn"
                            title="Последняя"
                        >
                            &#187;
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default ApartmentList; 