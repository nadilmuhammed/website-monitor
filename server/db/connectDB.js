import mongoose from "mongoose";

const connect = async() => {
    try {
        await mongoose.connect('mongodb://localhost:27017/website-monitor')
        console.log('Connected to MongoDB')
    } catch (error) {
        console.log('Error connecting to MongoDB')
    }
}

export default connect;