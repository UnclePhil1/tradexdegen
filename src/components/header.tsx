import '../App.css'
import Waitlist from '../components/waitlist'
const Header = () => {
    return (
        <>
            <div className="p-6 flex flex-col justify-center items-center text-center strips">
                <div className="w-full lg:w-1/2 h-full p-6 flex flex-col justify-center items-center text-center gap-4">
                    <h1 className="text-white text-5xl" data-aos="fade-up">Master crypto trading with confidence</h1>
                    <p className="text-gray-400 text-xl mt-4" data-aos="fade-up">Practice trading in real-time with zero risk to your capital. Experience live market conditions, test strategies, and build confidence before trading live.</p>
                    <Waitlist />
                </div>
            </div>
        </>
    )
}

export default Header