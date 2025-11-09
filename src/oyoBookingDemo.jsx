import React, { useState } from "react";
import { Calendar, MapPin, Users, Check, Loader2 } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = "https://easykey.roomsvital.com/bookings/create-booking"; // <-- REPLACE with your real POST URL

const OYOBookingDemo = () => {
  const [step, setStep] = useState("browse");
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    guestName: "",
    phone: "",
    email: "",
    checkIn: "",
    checkOut: "",
    guests: "1",
  });
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [error, setError] = useState(null);

  const hotel = {
    id: "Hotel Sayonara", // <-- used in payload
    name: "Hotel Sayonara",
    location: "Connaught Place, New Delhi",
    price: 1499,
    rating: 4.2,
    image:
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
  };

  const handleInputChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBookNow = () => {
    setStep("booking");
    setError(null);
  };

  const handleSubmitBooking = async () => {
    // basic validation
    if (
      !bookingData.guestName ||
      !bookingData.phone ||
      !bookingData.checkIn ||
      !bookingData.checkOut
    ) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    // construct payload according to sample you provided
    const apiPayload = {
      guestName: bookingData.guestName,
      hotelId: hotel.id,
      checkIn: new Date(bookingData.checkIn).toISOString(), // sample used ISO with time
      checkOut: new Date(bookingData.checkOut).toISOString(),
      numberOfGuests: Number(bookingData.guests),
      numberOfRooms: 1, // default, change if you add rooms UI
      phoneNumber: bookingData.phone,
      // optional: include email if your API accepts it
      email: bookingData.email || undefined,
    };

    try {
      const resp = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // add auth headers if your API needs them, e.g. Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(apiPayload),
      });

      if (!resp.ok) {
        // try to parse error body
        let errText = `${resp.status} ${resp.statusText}`;
        try {
          const errBody = await resp.json();
          // adapt to your API's error structure
          errText = errBody.message || JSON.stringify(errBody);
        } catch (e) {}
        throw new Error(errText);
      }

      // parse response (assume JSON)
      const respJson = await resp.json();

      // If API returns booking confirmation, use it. Otherwise create a fallback confirmation.
      const confirmation = respJson.booking || respJson || {
        booking_id:
          respJson.bookingId ||
          respJson.booking_id ||
          `OYO${Math.floor(10000 + Math.random() * 90000)}`,
        guest_name: apiPayload.guestName,
        phone: apiPayload.phoneNumber,
        check_in_date: apiPayload.checkIn,
        check_out_date: apiPayload.checkOut,
      };

      setBookingConfirmation(confirmation);
      setStep("confirmation");
    } catch (err) {
      console.error("Booking failed:", err);
      setError(
        typeof err === "string" ? err : err.message || "Booking failed"
      );
      alert("Booking failed: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // 🏨 Step 1: Browse Hotel
  if (step === "browse") {
    return (
      <div className="bg-light min-vh-100">
        <div className="bg-danger text-white p-3 shadow-sm">
          <div className="container d-flex justify-content-between align-items-center">
            <h4 className="mb-0 fw-bold">OYO</h4>
            <small>Self Check-In Hotels</small>
          </div>
        </div>

        <div className="container py-5">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <img
              src={hotel.image}
              alt={hotel.name}
              className="card-img-top"
              style={{ height: "250px", objectFit: "cover" }}
            />
            <div className="card-body">
              <h2 className="fw-bold">{hotel.name}</h2>
              <p className="text-muted mb-2">
                <MapPin size={16} className="me-1" />
                {hotel.location}
              </p>
              <p className="mb-3">
                <span className="badge bg-success me-2">★ {hotel.rating}</span>
                <span className="badge bg-primary">Self Check-In</span>
              </p>

              <div className="d-flex justify-content-between align-items-center border p-3 rounded-3 mb-3">
                <div>
                  <small className="text-muted">Check-In</small>
                  <div className="fw-semibold">After 11:00 AM</div>
                </div>
                <div>
                  <small className="text-muted">Check-Out</small>
                  <div className="fw-semibold">Before 11:00 AM</div>
                </div>
                <div>
                  <small className="text-muted">Rooms</small>
                  <div className="fw-semibold">Available</div>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-end">
                <div>
                  <small className="text-muted">Price per night</small>
                  <h2 className="text-danger fw-bold">₹{hotel.price}</h2>
                </div>
                <button
                  className="btn btn-danger btn-lg px-4"
                  onClick={handleBookNow}
                >
                  Book Now
                </button>
              </div>

              <div className="alert alert-info mt-4 mb-0">
                <Check size={18} className="me-2" />
                <strong>Contactless Check-In:</strong> Get your room code via
                SMS — no reception required!
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🧾 Step 2: Booking Form
  if (step === "booking") {
    return (
      <div className="bg-light min-vh-100">
        <div className="bg-danger text-white p-3 shadow-sm">
          <div className="container">
            <h4 className="mb-0 fw-bold">OYO Booking</h4>
          </div>
        </div>

        <div className="container py-5">
          <div className="card shadow-lg border-0 rounded-4 p-4">
            <h3 className="fw-bold mb-4">Complete Your Booking</h3>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-3">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="guestName"
                className="form-control"
                value={bookingData.guestName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                value={bookingData.phone}
                onChange={handleInputChange}
                placeholder="+91 XXXXXXXXXX"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={bookingData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Check-In Date *</label>
                <input
                  type="date"
                  name="checkIn"
                  className="form-control"
                  value={bookingData.checkIn}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Check-Out Date *</label>
                <input
                  type="date"
                  name="checkOut"
                  className="form-control"
                  value={bookingData.checkOut}
                  onChange={handleInputChange}
                  min={bookingData.checkIn}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Guests</label>
              <select
                name="guests"
                value={bookingData.guests}
                onChange={handleInputChange}
                className="form-select"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} Guest{n > 1 && "s"}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-light border rounded-3 p-3 mb-4">
              <div className="d-flex justify-content-between">
                <span>Room Price</span>
                <strong>₹{hotel.price}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Taxes (5%)</span>
                <strong>₹{Math.round(hotel.price * 0.05)}</strong>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <span className="fw-bold">Total</span>
                <strong className="text-danger">
                  ₹{hotel.price + Math.round(hotel.price * 0.12)}
                </strong>
              </div>
            </div>

            <button
              onClick={handleSubmitBooking}
              disabled={loading}
              className="btn btn-danger w-100 py-3 fw-bold"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="me-2 spinner-border" />
                  Processing...
                </>
              ) : (
                "Confirm Booking"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Step 3: Confirmation
  if (step === "confirmation") {
    return (
      <div className="bg-light min-vh-100">
        <div className="bg-danger text-white p-3 shadow-sm">
          <div className="container">
            <h4 className="mb-0 fw-bold">OYO Booking Confirmation</h4>
          </div>
        </div>

        <div className="container py-5">
          <div className="card shadow-lg border-0 rounded-4 p-5 text-center">
            <div className="text-success mb-3">
              <Check size={48} />
            </div>
            <h3 className="fw-bold mb-2">Booking Confirmed!</h3>
            <p className="text-muted mb-4">
              Your booking at <strong>{hotel.name}</strong> is confirmed.
            </p>

            <div className="border rounded-3 bg-white p-3 mb-4 text-start">
              <div className="mb-2">
                <strong>Booking ID:</strong>{" "}
                {bookingConfirmation.booking_id || bookingConfirmation.bookingId || "—"}
              </div>
              <div className="mb-2">
                <strong>Guest Name:</strong>{" "}
                {bookingConfirmation.guest_name || bookingConfirmation.guestName}
              </div>
              <div className="mb-2">
                <strong>Phone:</strong>{" "}
                {bookingConfirmation.phone || bookingConfirmation.phoneNumber}
              </div>
              <div className="mb-2">
                <strong>Check-In:</strong>{" "}
                {formatDate(bookingConfirmation.check_in_date || bookingConfirmation.checkIn)}
              </div>
              <div className="mb-2">
                <strong>Check-Out:</strong>{" "}
                {formatDate(bookingConfirmation.check_out_date || bookingConfirmation.checkOut)}
              </div>
            </div>

            <div className="alert alert-info">
              📱 Self Check-In Link has been sent to{" "}
              <strong>{bookingConfirmation.phone || bookingConfirmation.phoneNumber}</strong>.
              <br />
              Please upload your ID at least 3 hours before check-in.
            </div>

            <button
              onClick={() => window.location.reload()}
              className="btn btn-secondary mt-3"
            >
              Make Another Booking
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default OYOBookingDemo;
