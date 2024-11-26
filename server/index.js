//Import DB file
const {
    client,
    createTables,
    createCustomer,
    createRestaurant,
    fetchCustomers,
    fetchRestaurants,
    createReservation,
    fetchReservations,
    destroyReservation
} = require("./db")

//Create variables for initializing the app
const express = require("express")
const app = express()
const port = process.env.PORT

//App dependencies for middleware
app.use(express.json())
app.use(require("morgan")("dev"))

//API routes
//Get restaurants
app.get("/api/restaurants", async (req, res, next) => {
    try {
        res.send(await fetchRestaurants());
    } catch (error) {
        next(error)
    }
});

//Get customers
app.get("/api/customers", async (req, res, next) => {
    try {
        res.send(await fetchCustomers());
    } catch (error) {
        next(error)
    }
});

//Get reservations
app.get("/api/reservations", async (req, res, next) => {
    try {
        res.send(await fetchReservations());
    } catch (error) {
        next(error)
    }
});

//Create reservation
app.post("/api/reservations", async(req, res, next) => {
    try {
        res.status(201).send(
            await createReservation({
                booking_date: req.body.booking_date,
                party_count: req.body.party_count,
                customer_id: req.body.customer_id,
                restaurant_id: req.body.restaurant_id
            })
        );
    } catch (error) {
        next(error)
    }
});

//Delete reservation
app.delete("/api/customers/:customer_id/reservations/:id", async(req, res, next) => {
    try {
        res.status(204).send(
            await destroyReservation({
                reservation_id: req.params.id,
                customer_id: req.params.customer_id
            })
        );
    } catch (error) {
        next(error)
    }
})

//Initialization function
const init = async() => {
    //Connect to the client
    await client.connect();
    //Call the function to create tables
    await createTables();

    //Call the function to create customers and restaurants
    const [Sravan, Julian, Tyler, Andrew, RedFish, Omakasi, Mooyah, Fogatas] = await Promise.all([
        createCustomer({name: "Sravan"}),
        createCustomer({name: "Julian"}),
        createCustomer({name: "Tyler"}),
        createCustomer({name: "Andrew"}),
        createRestaurant({name: "RedFish"}),
        createRestaurant({name: "Omakasi"}),
        createRestaurant({name: "Mooyah"}),
        createRestaurant({name: "Fogatas"})
    ])

    //Call the functions to print to console the restaurants and customers in the DB
    console.log(await fetchRestaurants());
    console.log(await fetchCustomers());

    //Call function to create reservations
    const [reservation, reservation1, reservation2, reservation3] = await Promise.all([
        createReservation({
            booking_date: "11/28/2024",
            party_count: 5,
            customer_id: Sravan.id,
            restaurant_id: Omakasi.id
        }),
        createReservation({
            booking_date: "11/29/2024",
            party_count: 3,
            customer_id: Julian.id,
            restaurant_id: RedFish.id
        }),
        createReservation({
            booking_date: "11/30/2024",
            party_count: 4,
            customer_id: Tyler.id,
            restaurant_id: Mooyah.id
        }),
        createReservation({
            booking_date: "11/30/2024",
            party_count: 7,
            customer_id: Andrew.id,
            restaurant_id: Fogatas.id
        })
    ]);

    //Print in the console the existing reservations
    console.log(await fetchReservations());
    
    //Call the fucntion to delete a reservation
    await destroyReservation({reservation_id: reservation1.id, customer_id: Julian.id})

    //Print the current reservations in the system to make destroying is working
    console.log(await fetchReservations());

    //Just for dev
    app.listen(port, () => console.log(`Listening on port ${port}`))
}

//Call the function
init();