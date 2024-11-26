//To access the env variables
require("dotenv").config()

//Create variables for initializing the client
const pg = require("pg")
const client = new pg.Client(process.env.DATABASE_URL)

//Variable declaration to be able to use UUID
const uuid = require("uuid")

//createTables
const createTables = async() => {
    const SQL = `
        DROP TABLE IF EXISTS reservations;    
        DROP TABLE IF EXISTS restaurants;
        DROP TABLE IF EXISTS customers;

        CREATE TABLE restaurants(
            id UUID PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE
        );

        CREATE TABLE customers(
            id UUID PRIMARY KEY,
            name VARCHAR(100) NOT NULL
        );

        CREATE TABLE reservations(
            id UUID PRIMARY KEY,
            booking_date DATE NOT NULL,
            party_count INTEGER NOT NULL,
            customer_id UUID REFERENCES customers(id) NOT NULL,
            restaurant_id UUID REFERENCES restaurants(id) NOT NULL
        );
    `;
    await client.query(SQL);
}

//createCustomer
const createCustomer = async ({ name }) => {
    const SQL = `
        INSERT INTO customers(id, name)
        VALUES($1, $2)
        RETURNING *
    `;
    const response = await client.query(SQL, [
        uuid.v4(),
        name
    ]);
    
    return response.rows[0];
};

//createRestaurant
const createRestaurant = async ({ name }) => {
    const SQL = `
        INSERT INTO restaurants(id, name)
        VALUES($1, $2)
        RETURNING *
    `;
    const response = await client.query(SQL, [
        uuid.v4(),
        name
    ]);
    
    return response.rows[0];
};

//fetchCustomers
const fetchCustomers = async() => {
    const SQL = `SELECT * FROM customers`;
    const response = await client.query(SQL);
    return response.rows
};

//fetchRestaurants
const fetchRestaurants = async() => {
    const SQL = `SELECT * FROM restaurants`;
    const response = await client.query(SQL);
    return response.rows
};

//createReservation
const createReservation = async({booking_date, party_count, customer_id, restaurant_id}) => {
    const SQL = `
        INSERT INTO reservations(id, booking_date, party_count, customer_id, restaurant_id)
        VALUES($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const response = await client.query(SQL, [
        uuid.v4(),
        booking_date,
        party_count,
        customer_id,
        restaurant_id
    ]);
    return response.rows[0]
};

//fetchReservation
const fetchReservations = async() => {
    const SQL = `SELECT * FROM reservations`;
    const response = await client.query(SQL);
    return response.rows
};

//destroyReservation
const destroyReservation = async({reservation_id, customer_id}) => {
    const SQL = `
        DELETE FROM reservations
        WHERE id=$1 AND customer_id=$2
    `;
    await client.query(SQL, [
        reservation_id,
        customer_id
    ]);
}

//Exporting from datalayer to be able to import and use in server file
module.exports = {
    client,
    createTables,
    createCustomer,
    createRestaurant,
    fetchCustomers,
    fetchRestaurants,
    createReservation,
    fetchReservations,
    destroyReservation
}