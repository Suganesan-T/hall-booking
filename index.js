const express = require('express')
const bodyparse = require('body-parser')

const app = express()
app.use(bodyparse.json())

//Creating variables for storing datas
let rooms = [
  {
    room_id: "R1",
    seats_available: "10",
    amenities: "AC, TV, Room Service, Heater",
    price_perHr: "250"
  }
]

let bookings = [{
  customer: "Suganesan",
  booking_date: "01/02/2024",
  start_time: "12:00",
  end_time: "18:00",
  booking_id: "B1",
  room_id: "R1",
  status: "booked",
  booked_on: "20/04/2024"
}]

let customers = [
  {
    name: "Suganesan",
    bookings: [
      {
        customer: "Suganesan",
        booking_date: "01/02/2024",
        start_time: "12:00",
        end_time: "18:00",
        booking_id: "B1",
        room_id: "R1",
        status: "booked",
        booked_on: "20/04/2024"
      }
    ]
  }
]

//View all rooms and its details

app.get("/all", (req, res) => {
  res.status(200).json({ RoomList: rooms })
  console.log(rooms)
})

//Create a room with number of seats available, amenities, price per hour

app.post("/create-room", (req, res) => {
  const room = req.body
  const idExists = rooms.find((e) => e.room_id === room.room_id)
  if (idExists !== undefined) {
    return res.status(400).json({ message: "Room Already Exist" })
  }
  else {
    rooms.push(room)
    return res.status(201).json({ message: "Room Created" })
  }

})

//Booking a room with customer name, date, start time, end,time,room id

app.post("/book-room/:id", (req, res) => {
  const { id } = req.params
  let bookRoom = req.body
  let date = new Date()
  let dateFormat = date.toLocaleDateString()
  let idExists = rooms.find((e) => e.room_id === id)
  if (idExists !== undefined) {
    res.status(400).json({ message: "Room does not exist", RoomList: rooms })
  }

  //verifying booked date

  let matchID = bookings.filter((e) => e.room_id === id)
  try {
    if (matchID.length > 0) {
      let dateCheck = matchID.filter((e) => { return e.booking_date === bookRoom.booking_date })
      if (dateCheck.length === 0) {
        let newID = "B" + (bookings.length + 1)
        let newBooking = { ...bookRoom, booking_id: newID, room_id: id, status: "Booked", booked_on: dateFormat }
        bookings.push(newBooking)
        return res.status(201).json({ message: "Hall Booked", Bookings: bookings, added: newBooking })
      }
      else {
        return res.status(400).json({ message: "Hall already booked for the date, choose another hall", bookings: bookings })
      }
    }
    else {
      let newID = "B" + (bookings.length + 1)
      let newBooking = { ...bookRoom, booking_id: newID, room_id: id, status: "Booked", booked_on: dateFormat }
      bookings.push(newBooking)
      const customerDetails = customers.find((e) => e.name === newBooking.customer)
      if (customerDetails) {
        customerDetails.bookings.push(newBooking)
      }
      else {
        customers.push({ name: newBooking.customer, bookings: [newBooking] })
      }
      return res.status(201).json({ message: "Hall Booked", Bookings: bookings, added: newBooking })

    }

  } catch (error) {
    res.status(400).json({ message: "Error in hall booking", error: error, data: bookings })
  }
})

//List all rooms with booked data

app.get("/view-bookings",(req,res)=>{
  const bookedRooms = bookings.map(booking =>{
    const{room_id,status,customer,booking_date,start_time,end_time} = booking
    return {room_id,status,customer,booking_date,start_time,end_time}
  })
  res.status(201).json(bookedRooms)
})

//List all customers with booked data

app.get("/view-customers",(req,res)=>{
  const viewCustomer = customers.map(customer=>{
    const{name,bookings} = customer
    const customerDetails = bookings.map(booking=>{
      const{room_id,booking_date,start_time,end_time}=booking
      return{name,room_id,booking_date,start_time,end_time}
    })
    return customerDetails
  })
  res.json(viewCustomer)
})

//List how many times a customer has booked the rooms

app.get('/customer/:name', (req, res) => {
  const { name } = req.params;
  const customer = customers.find(cust => cust.name === name);
  if (!customer) {
    res.status(404).json({ error: 'Customer not found' });
    return;
  }
  const customerBookings = customer.bookings.map(booking => {
    const { customer,room_id, start_time, end_time, booking_id, status, booking_date,booked_on } = booking;
    return { customer, room_id, start_time, end_time, booking_id, status, booking_date,booked_on };
  });
  res.json(customerBookings);
});





app.listen(3030, () => console.log("Started Server Hall Booking"))