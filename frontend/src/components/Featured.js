import React, { useState, useEffect } from 'react'
import axios from 'axios'
// import BTC from '../assets/btc-img.png'
import { FiArrowUpRight, FiArrowDown } from 'react-icons/fi'
import './Featured.css'

const Featured = () => {

    const [data, setData] = useState(null)

    const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=6&page=1&sparkline=false'

    useEffect(() => {
        axios.get(url).then((response) => {
            setData(response.data)
        }).catch(() => setData([]))
    }, [])

    if (!data) return null

    return (
        <div id='feat_id' className='featured'>
            <div className='container'>
                {/* Left */}
                <div className='left'>
                    <h2>Explore top Crypto's Like Bitcoin, Ethereum, and Dogecoin</h2>
                    <p>See all available assets: Cryptocurrencies and NFT's</p> 
                    <button className='btn'>See More Coins</button>
                </div>

                {/* Right */}

                <div className='right'>
                    {data.slice(0, 6).map((coin) => {
                        const change = coin.price_change_percentage_24h
                        const hasChange = Number.isFinite(change)
                        const isNegative = hasChange && change < 0

                        return (
                            <div className='card' key={coin.id}>
                                <div className='top'>
                                    <img src={coin.image} alt={coin.name} />
                                </div>
                                <div>
                                    <h5>{coin.name}</h5>
                                    <p>${Number.isFinite(coin.current_price) ? coin.current_price.toLocaleString() : 'N/A'}</p>
                                </div>
                                <span className={hasChange ? (isNegative ? 'red' : 'green') : ''}>
                                    {hasChange && (isNegative
                                        ? <FiArrowDown className='icon' />
                                        : <FiArrowUpRight className='icon' />)}
                                    {hasChange ? `${change.toFixed(2)}%` : 'N/A'}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

        </div>
    )
}

export default Featured
