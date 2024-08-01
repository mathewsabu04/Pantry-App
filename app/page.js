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

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPantry, setFilteredPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItem] = useState("");
  const [updateOpen, setUpdateOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState(0);

  const updateInventory = async () => {
    try {
      const pantrySnapshot = await getDocs(collection(firestore, "pantry"));
      const pantryItems = pantrySnapshot.docs.map((doc) => ({
        name: doc.id,
        ...doc.data(),
      }));
      setPantry(pantryItems);
      setFilteredPantry(pantryItems);
    } catch (error) {
      console.error("Error updating inventory: ", error);
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  useEffect(() => {
    const results = pantry.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPantry(results);
  }, [searchQuery, pantry]);

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "pantry"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "pantry"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const updateItemQuantity = async (item, quantity) => {
    const docRef = doc(collection(firestore, "pantry"), item);
    if (quantity <= 0) {
      await deleteDoc(docRef);
    } else {
      await setDoc(docRef, { quantity: quantity });
    }
    await updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleUpdateOpen = (item) => {
    setCurrentItem(item);
    setNewQuantity(item.quantity);
    setUpdateOpen(true);
  };

  const handleUpdateClose = () => setUpdateOpen(false);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      <Box
        position="absolute"
        top={0}
        transform="translateX(-50%)"
        bgcolor="white"
        padding={2}
        zIndex={10}
      >
        <Typography variant="h3">Pantry App</Typography>
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          sx={{
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItem(e.target.value)}
            />
            <Button
              variant="outlined"
              color="success"
              onClick={() => {
                addItem(itemName);
                setItem("");
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Modal open={updateOpen} onClose={handleUpdateClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          sx={{
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Typography variant="h6">Update Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={newQuantity}
              type="number"
              onChange={(e) => setNewQuantity(Number(e.target.value))}
            />
            <Button
              variant="outlined"
              color="success"
              onClick={() => {
                updateItemQuantity(currentItem.name, newQuantity);
                handleUpdateClose();
              }}
            >
              Update
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button
        variant="contained"
        color="success"
        onClick={handleOpen}
        sx={{ width: "150px" }}
      >
        Add New Item
      </Button>
      <Box width="50%" border="1px solid #333" padding={2}>
        <Box
          width="100%"
          height="100px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box sx={{ padding: 2 }}>
            <TextField
              variant="outlined"
              margin="normal"
              placeholder="Search..."
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ marginTop: 2 }}
            />
          </Box>
        </Box>
        <Stack width="100%" height="300px" spacing={2} overflow="auto">
          {filteredPantry.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              padding={5}
              bgcolor="#f5f5f5"
              border="1px solid #ddd"
            >
              <Typography variant="h3" color="#333">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="h3" color="#333">
                {quantity}
              </Typography>

              <Button
                variant="contained"
                onClick={() => handleUpdateOpen({ name, quantity })}
              >
                Update
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => removeItem(name)}
              >
                Remove
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
