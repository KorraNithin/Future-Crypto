import React from 'react';
import './coin.css';

const Coin = ({
  name,
  price,
  symbol,
  marketcap,
  volume,
  image,
  priceChange
}) => {
  const hasPriceChange = Number.isFinite(priceChange)
  const formatNumber = (value) => Number.isFinite(value) ? value.toLocaleString() : 'N/A'

  return (
    <div className='box'>
      <div className='coin-row'>
        <div className='coin'>
          <img src={image} alt='crypto' />
          <h1>{name}</h1>
          <p className='coin-symbol'>{symbol}</p>
        </div>
        <div className='coin-data'>
          <p className='coin-price'>${formatNumber(price)}</p>
          <p className='coin-volume'>volume: ${formatNumber(volume)}</p>

          {!hasPriceChange ? (
            <p className='coin-percent'>N/A</p>
          ) : priceChange < 0 ? (
            <p className='coin-percent red'>{priceChange.toFixed(2)}%</p>
          ) : (
            <p className='coin-percent green'>{priceChange.toFixed(2)}%</p>
          )}

          <p className='coin-marketcap'>
            Mkt Cap: ${formatNumber(marketcap)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Coin
