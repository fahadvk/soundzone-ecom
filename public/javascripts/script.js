

const prodid = document.getElementById("prodId");

const btn = document.getElementById("incbtn");
const qty = document.getElementById("qty");
// const val =  qty.value;
// const price = document.getElementById("price").value;
// let total =
// btn.addEventListener("click", () => {
// function incQty(id, qty) {
//   const Prodid = id;
//   console.log(Prodid, btn);  
//   $.ajax({
//     url: "/changeQty",
//     data: {
//       Product: Prodid,
//       Qty: qty,
//       // val: val,
//     },

//     method: "POST",
//     success: (response) => {
//       console.log(response);
//       //   alert(a)
//     },
//     // error: {
//     //   //   alert('error'),
//     // },
//   });
// }
function addtowish(id){
  const Prodid = id;
  console.log(Prodid);
  $.ajax({
  url: "/add-to-wishlist",
  data: {
    Product: Prodid,
 
  },

  method: "POST",
  success: (response) => {
    console.log(response);
    //   alert(a)
  },
  // error: {
  //   //   alert('error'),
  // },
});
function removeitem(id)
{
const Prodid = id;
console.log(Prodid, btn);
$.ajax({
url: "/delete-wish-item",
data: {
  Product: Prodid,
 
},

method: "POST",
success: (response) => {
  console.log(response);
},

});
}

//   axios
//     .post("/changeQty", {
//       Product: Prodid,
//       Qty: 1,
//       val: val,
//     })
//     .then((response) => {
//       console.log(response);
//     });
// });

function checkout() {
    let Payment = $('input[name="Payment"]:checked').val()
    let Address = $('input[name="Address"]:checked').val()
    let Total = document.getElementById("Total").value
    const Subtotal = document.getElementById("Subtotal").value
    let Discount = document.getElementById("Discount").value
    $.ajax({
        url: "/placeorder",
        data: {
            Payment: Payment,
            Address: Address,
            Total,
            Subtotal,
            Discount,
            //   Qty: qty,
            // val: val,
        },

        method: "post",
        success: (response) => {
            console.log('ggg')
            if (response.cod) {
                console.log("idfjsoi");
                location.assign("/order-confirm/response.data._id");
                //   alert(a)
            }
            else {
                razorpayPayment(response)
            }
        },
    })
}
function razorpayPayment(data) {
  var options = {
    "key": "rzp_test_Uxh9u0c2EwOZ14", // Enter the Key ID generated from the Dashboard
    "amount":  data.amount,  // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    "currency": "INR",
    "name": "AudioZone",
    "description": "Test Transaction",
    "image": "https://example.com/your_logo",
    "order_id":  data.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    "handler": function (response){
        // alert(response.razorpay_payment_id);
        // alert(response.razorpay_order_id);
        // alert(response.razorpay_signature)
        verifyPayment(response, data);
    },
    "prefill": {
        "name": "Gaurav Kumar",
        "email": "gaurav.kumar@example.com",
        "contact": "9999999999"
    },
    "notes": {
        "address": "Razorpay Corporate Office"
    },
    "theme": {
        "color": "#3399cc"
    }
};
    var rzp1 = new Razorpay(options);
    rzp1.open();

}
function verifyPayment(payment, order) {
    console.log(payment)
    $.ajax({
        url: "/verifypayment",
        data: {
            Details: payment,
            Order: order,
        },

        method: "post",
        success: (response) => {
            console.log(response);
            alert(response)
        },
    })
}
}
