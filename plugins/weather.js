const axios = require('axios');

module.exports = {
    command: 'weather',
    description: 'Get current weather information for any city',
    category: 'tools',
    execute: async (sock, m, params) => {
        const { args, reply, prefix } = params;
        
        try {
            const city = args.join(' ');
            
            if (!city) {
                return await reply(`🌤️ *WEATHER*\n\n*Usage:* ${prefix}weather <city name>\n\n*Example:*\n${prefix}weather London\n${prefix}weather New York\n${prefix}weather Tokyo`);
            }

            await sock.sendMessage(m.chat, { 
                react: { text: "🌤️", key: m.key } 
            });

            // Send initial "fetching" message
            const fetchingMsg = await sock.sendMessage(m.chat, {
                text: '🌤️ *Fetching weather data...*'
            });

            // Fetch weather data from API
            let weatherData = null;

            try {
                const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=060a6bcfa19809c2cd4d97a212b19273&units=metric`;
                const res = await axios.get(apiUrl, { timeout: 30000 });
                
                if (res.data) {
                    weatherData = res.data;
                }
            } catch (error) {
                console.log('Weather API error:', error.message);
            }

            if (!weatherData) {
                await sock.sendMessage(m.chat, {
                    text: '❌ Could not fetch weather data. Please check the city name and try again.',
                    edit: fetchingMsg.key
                });
                
                await sock.sendMessage(m.chat, { 
                    react: { text: "❌", key: m.key } 
                });
                return;
            }

            // Format weather response
            const weatherIcon = getWeatherEmoji(weatherData.weather[0].main);
            const temp = Math.round(weatherData.main.temp);
            const feelsLike = Math.round(weatherData.main.feels_like);
            const tempMin = Math.round(weatherData.main.temp_min);
            const tempMax = Math.round(weatherData.main.temp_max);
            const humidity = weatherData.main.humidity;
            const pressure = weatherData.main.pressure;
            const windSpeed = weatherData.wind.speed;
            const description = weatherData.weather[0].description;
            const cityName = weatherData.name;
            const country = weatherData.sys.country;
            const visibility = weatherData.visibility / 1000; // Convert to km

            const weatherResponse = `${weatherIcon} *WEATHER REPORT*

📍 *Location:* ${cityName}, ${country}
🌡️ *Temperature:* ${temp}°C
🌡️ *Feels Like:* ${feelsLike}°C
📊 *Min/Max:* ${tempMin}°C / ${tempMax}°C
☁️ *Condition:* ${capitalizeWords(description)}
💧 *Humidity:* ${humidity}%
🌀 *Pressure:* ${pressure} hPa
💨 *Wind Speed:* ${windSpeed} m/s
👁️ *Visibility:* ${visibility} km

> 𝐓𝐇𝐄 𝐒𝐓𝐈𝐀𝐍`;

            // Edit the fetching message with actual weather data
            await sock.sendMessage(m.chat, {
                text: weatherResponse,
                edit: fetchingMsg.key
            });

            await sock.sendMessage(m.chat, { 
                react: { text: "✅", key: m.key } 
            });

        } catch (error) {
            console.error('Error in weather command:', error);
            await sock.sendMessage(m.chat, { 
                react: { text: "❌", key: m.key } 
            });
            await reply('❌ An error occurred while fetching weather data. Please try again.');
        }
    }
};

// Helper function to get weather emoji
function getWeatherEmoji(condition) {
    const weatherEmojis = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Drizzle': '🌦️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Smoke': '🌫️',
        'Haze': '🌫️',
        'Dust': '🌫️',
        'Fog': '🌫️',
        'Sand': '🌫️',
        'Ash': '🌫️',
        'Squall': '💨',
        'Tornado': '🌪️'
    };
    
    return weatherEmojis[condition] || '🌤️';
}

// Helper function to capitalize words
function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}