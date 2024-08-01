"use client"; // Indicates that this code is for a client-side React component
import { useState, useEffect } from "react"; // Import React hooks for state and effect management
import { firestore } from "@/firebase"; // Import the Firestore instance from your Firebase configuration
import {
  Typography,
  Box,
  Modal,
  TextField,
  Stack,
  Button,
} from "@mui/material"; // Import Material-UI components
import {
  collection,
  getDoc,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
} from "firebase/firestore"; // Import Firestore functions for database operations

// Define and export the main component for the Home page
export default function Home() {
  // Define state variables using React hooks
  const [pantry, setPantry] = useState([]); // State for storing pantry items
  const [searchQuery, setSearchQuery] = useState(""); // State for storing search query
  const [filteredPantry, setFilteredPantry] = useState([]); // State for storing filtered pantry items based on search query
  const [open, setOpen] = useState(false); // State for controlling the "Add Item" modal visibility
  const [itemName, setItem] = useState(""); // State for storing the name of the item to be added
  const [updateOpen, setUpdateOpen] = useState(false); // State for controlling the "Update Item" modal visibility
  const [currentItem, setCurrentItem] = useState(null); // State for storing the item being updated
  const [newQuantity, setNewQuantity] = useState(0); // State for storing the new quantity of the item being updated

  // Function to update the pantry inventory by fetching data from Firestore
  const updateInventory = async () => {
    try {
      const pantrySnapshot = await getDocs(collection(firestore, "pantry")); // Fetch all documents in the "pantry" collection
      const pantryItems = pantrySnapshot.docs.map((doc) => ({
        name: doc.id, // Use the document ID as the item name
        ...doc.data(), // Spread the document data into the item object
      }));
      setPantry(pantryItems); // Update the pantry state with the fetched items
      setFilteredPantry(pantryItems); // Update the filtered pantry state with the fetched items
    } catch (error) {
      console.error("Error updating inventory: ", error); // Log any errors that occur during fetching
    }
  };

  // useEffect hook to update the inventory when the component mounts
  useEffect(() => {
    updateInventory(); // Call the updateInventory function when the component mounts
  }, []); // Empty dependency array ensures this effect runs only once

  // useEffect hook to filter the pantry items based on the search query
  useEffect(() => {
    const results = pantry.filter(
      (item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()) // Filter items by name
    );
    setFilteredPantry(results); // Update the filtered pantry state with the filtered items
  }, [searchQuery, pantry]); // Dependencies: searchQuery and pantry

  // Function to remove an item from the pantry
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "pantry"), item); // Reference to the document in Firestore
    const docSnap = await getDoc(docRef); // Get the document snapshot

    if (docSnap.exists()) {
      const { quantity } = docSnap.data(); // Get the quantity from the document data
      if (quantity === 1) {
        await deleteDoc(docRef); // Delete the document if quantity is 1
      } else {
        await setDoc(docRef, { quantity: quantity - 1 }); // Decrement the quantity by 1
      }
    }
    await updateInventory(); // Update the inventory after removing the item
  };

  // Function to add an item to the pantry
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "pantry"), item); // Reference to the document in Firestore
    const docSnap = await getDoc(docRef); // Get the document snapshot

    if (docSnap.exists()) {
      const { quantity } = docSnap.data(); // Get the quantity from the document data
      await setDoc(docRef, { quantity: quantity + 1 }); // Increment the quantity by 1
    } else {
      await setDoc(docRef, { quantity: 1 }); // Set the quantity to 1 if the document does not exist
    }
    await updateInventory(); // Update the inventory after adding the item
  };

  // Function to update the quantity of an item in the pantry
  const updateItemQuantity = async (item, quantity) => {
    const docRef = doc(collection(firestore, "pantry"), item); // Reference to the document in Firestore
    if (quantity <= 0) {
      await deleteDoc(docRef); // Delete the document if the quantity is 0 or less
    } else {
      await setDoc(docRef, { quantity: quantity }); // Update the document with the new quantity
    }
    await updateInventory(); // Update the inventory after updating the item quantity
  };

  // Function to open the "Add Item" modal
  const handleOpen = () => setOpen(true); // Set the open state to true

  // Function to close the "Add Item" modal
  const handleClose = () => setOpen(false); // Set the open state to false

  // Function to open the "Update Item" modal
  const handleUpdateOpen = (item) => {
    setCurrentItem(item); // Set the current item to be updated
    setNewQuantity(item.quantity); // Set the new quantity to the current item's quantity
    setUpdateOpen(true); // Set the updateOpen state to true
  };

  // Function to close the "Update Item" modal
  const handleUpdateClose = () => setUpdateOpen(false); // Set the updateOpen state to false

  // Render the component
  return (
    <Box
      width="100vw" // Full viewport width
      height="100vh" // Full viewport height
      display="flex" // Flexbox display
      flexDirection="column" // Column direction
      justifyContent="center" // Center content vertically
      alignItems="center" // Center content horizontally
      gap={2} // Gap between flex items
    >
      <Box
        position="absolute" // Absolute positioning
        top={0} // Position at the top
        transform="translateX(-50%)" // Center horizontally
        bgcolor="white" // White background color
        padding={2} // Padding of 2 units
        zIndex={10} // Higher stacking context
      >
        <Typography variant="h3">Pantry App</Typography> // Title of the app
      </Box>
      <Modal open={open} onClose={handleClose}>
        {" "}
        // "Add Item" modal
        <Box
          position="absolute" // Absolute positioning
          top="50%" // Center vertically
          left="50%" // Center horizontally
          sx={{
            transform: "translate(-50%, -50%)", // Translate to center
            width: 400, // Width of 400 units
            bgcolor: "background.paper", // Background color from theme
            border: "2px solid #000", // Black border
            boxShadow: 24, // Shadow for depth
            p: 4, // Padding of 4 units
            display: "flex", // Flexbox display
            flexDirection: "column", // Column direction
            gap: 3, // Gap between flex items
          }}
        >
          <Typography variant="h6">Add Item</Typography> // Modal title
          <Stack width="100%" direction="row" spacing={2}>
            {" "}
            // Horizontal stack of inputs
            <TextField
              variant="outlined" // Outlined variant
              fullWidth // Full width
              value={itemName} // Bind value to itemName state
              onChange={(e) => setItem(e.target.value)} // Update itemName state on change
            />
            <Button
              variant="outlined" // Outlined variant
              color="success" // Success color
              onClick={() => {
                addItem(itemName); // Call addItem function
                setItem(""); // Reset itemName state
                handleClose(); // Close the modal
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Modal open={updateOpen} onClose={handleUpdateClose}>
        {" "}
        // "Update Item" modal
        <Box
          position="absolute" // Absolute positioning
          top="50%" // Center vertically
          left="50%" // Center horizontally
          sx={{
            transform: "translate(-50%, -50%)", // Translate to center
            width: 400, // Width of 400 units
            bgcolor: "background.paper", // Background color from theme
            border: "2px solid #000", // Black border
            boxShadow: 24, // Shadow for depth
            p: 4, // Padding of 4 units
            display: "flex", // Flexbox display
            flexDirection: "column", // Column direction
            gap: 3, // Gap between flex items
          }}
        >
          <Typography variant="h6">Update Item</Typography> // Modal title
          <Stack width="100%" direction="row" spacing={2}>
            {" "}
            // Horizontal stack of inputs
            <TextField
              variant="outlined" // Outlined variant
              fullWidth // Full width
              value={newQuantity} // Bind value to newQuantity state
              type="number" // Number input
              onChange={(e) => setNewQuantity(Number(e.target.value))} // Update newQuantity state on change
            />
            <Button
              variant="outlined" // Outlined variant
              color="success" // Success color
              onClick={() => {
                updateItemQuantity(currentItem.name, newQuantity); // Call updateItemQuantity function
                handleUpdateClose(); // Close the modal
              }}
            >
              Update
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button
        variant="contained" // Contained variant
        color="success" // Success color
        onClick={handleOpen} // Open the "Add Item" modal
        sx={{ width: "150px" }} // Fixed width
      >
        Add New Item
      </Button>
      <Box width="50%" border="1px solid #333" padding={2}>
        {" "}
        // Container for the pantry items
        <Box
          width="100%" // Full width
          height="100px" // Fixed height
          display="flex" // Flexbox display
          alignItems="center" // Center items vertically
          justifyContent="center" // Center items horizontally
        >
          <Box sx={{ padding: 2 }}>
            {" "}
            // Container for the search input
            <TextField
              variant="outlined" // Outlined variant
              margin="normal" // Normal margin
              placeholder="Search..." // Placeholder text
              fullWidth // Full width
              value={searchQuery} // Bind value to searchQuery state
              onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery state on change
              sx={{ marginTop: 2 }} // Top margin of 2 units
            />
          </Box>
        </Box>
        <Stack width="100%" height="300px" spacing={2} overflow="auto">
          {" "}
          // Stack for pantry items list
          {filteredPantry.map(
            (
              { name, quantity } // Map over filtered pantry items
            ) => (
              <Box
                key={name} // Unique key for each item
                width="100%" // Full width
                minHeight="150px" // Minimum height
                display="flex" // Flexbox display
                justifyContent="space-between" // Space between items
                alignItems="center" // Center items vertically
                padding={5} // Padding of 5 units
                bgcolor="#f5f5f5" // Background color
                border="1px solid #ddd" // Border style
              >
                <Typography variant="h3" color="#333">
                  {" "}
                  // Item name
                  {name.charAt(0).toUpperCase() + name.slice(1)} // Capitalize
                  the first letter
                </Typography>
                <Typography variant="h3" color="#333">
                  {" "}
                  // Item quantity
                  {quantity}
                </Typography>

                <Button
                  variant="contained" // Contained variant
                  onClick={() => handleUpdateOpen({ name, quantity })} // Open the "Update Item" modal
                >
                  Update
                </Button>
                <Button
                  variant="contained" // Contained variant
                  color="error" // Error color
                  onClick={() => removeItem(name)} // Remove the item
                >
                  Remove
                </Button>
              </Box>
            )
          )}
        </Stack>
      </Box>
    </Box>
  );
}
