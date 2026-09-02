import React,{useState,useMemo} from 'react'
import './Hero.css'
import { apiEndpoint } from '../config'

const FRAGMENT_COUNT = 30

// Generates the scatter of small gold fragments breaking off the coin's right edge.
// Computed once on mount so the layout is stable across re-renders.
function useFragments() {
    return useMemo(() => {
        return Array.from({ length: FRAGMENT_COUNT }).map((_, i) => {
            // Cone facing right, matching the direction the coin appears to be dissolving toward
            const angle = (-68 + Math.random() * 136) * (Math.PI / 180)
            const edgeR = 42 + Math.random() * 6 // % radius, roughly at the coin's edge
            const startX = 50 + Math.cos(angle) * edgeR
            const startY = 50 + Math.sin(angle) * edgeR

            const dist = 70 + Math.random() * 210
            const tx = Math.cos(angle) * dist
            const ty = Math.sin(angle) * dist + Math.random() * 40 - 10

            return {
                id: i,
                startX,
                startY,
                tx: tx.toFixed(1),
                ty: ty.toFixed(1),
                size: (4 + Math.random() * 11).toFixed(1),
                delay: (Math.random() * 6).toFixed(2),
                duration: (4 + Math.random() * 3.5).toFixed(2),
                rot: Math.round(Math.random() * 360)
            }
        })
    }, [])
}

const Hero = () => {

    const fragments = useFragments()

    const [user,setUser] = useState({
        email:""
    });

    let name , value;
    const handleInputs= (e)=>{
        name=e.target.name;
        value=e.target.value;
        
        setUser({...user, [name]:value})

    }


    const PostData= async(e) =>{
        e.preventDefault();

        const{email} = user;

        const res = await fetch(apiEndpoint('/subscribe'),{
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ email})
        
        });

        const data = await res.json();

        if(data.status === 422 || !data){
            window.alert("Invalid Registration");
        } else{
            window.alert("Subscribed to the Daily Newsletter!")
        }



    } 


    return (
        <div id= 'hero_id' className='hero'>

            {/* Large gold Bitcoin, continuously dissolving into small fragments */}
            <div className='hero-coin-wrap' aria-hidden='true'>
                <div className='btc-coin'>
                    <div className='coin-circuit' />
                    <svg className='coin-ring-text' viewBox='0 0 200 200'>
                        <path
                            id='ringPath'
                            fill='none'
                            d='M100,100 m-84,0 a84,84 0 1,1 168,0 a84,84 0 1,1 -168,0'
                        />
                        <text>
                            <textPath href='#ringPath' startOffset='0%'>
                                • BITCOIN • DIGITAL • DECENTRALIZED • BITCOIN • DIGITAL • DECENTRALIZED
                            </textPath>
                        </text>
                    </svg>
                    <span>₿</span>
                </div>
                <div className='fragment-field'>
                    {fragments.map(f => (
                        <span
                            key={f.id}
                            className='fragment'
                            style={{
                                left: `${f.startX}%`,
                                top: `${f.startY}%`,
                                width: `${f.size}px`,
                                height: `${f.size}px`,
                                '--tx': `${f.tx}px`,
                                '--ty': `${f.ty}px`,
                                '--rot': `${f.rot}deg`,
                                animationDelay: `${f.delay}s`,
                                animationDuration: `${f.duration}s`
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className='container'>

                {/* Left Side */}
                <div className='left'>
                    <p className='eyebrow-text'>Buy & Sell Crypto 24/7 using your retirement account</p>
                    <h1>Invest in the Best Cryptocurrency with Us</h1>
                    <p className='sub-text'>Buy, sell, and store hundreds of cryptocurrencies</p>
                    <h2>Subscribe to Our Newsletter</h2>
                    <div className='input-container'>
                        <form action="/subscribe" method="POST">
                        <input type='email'name="email" 
                        value={user.name}
                        onChange = {handleInputs}
                        placeholder='Enter your email address' required />
                                               
                        <button className='btn'type="submit" onClick={PostData}>Subscribe</button>
                        </form>
                    </div>
                </div>


                {/* Right Side is now occupied by the coin, kept clear for it to show through */}
                <div className='right' aria-hidden='true'></div>
            </div>
        </div>
    )
}

export default Hero