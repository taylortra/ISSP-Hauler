// const admin = require('firebase-admin');
// const firestore = admin.firestore();
const admin = require('firebase-admin');

//================================ Create new post on user app =====================================//
const createPost = async (req, res) => {
    try {
        const {
            userId,
            service,
            postHeading,
            postDescription,
            loadWeight,
            numberOfItems,
            imageUrl,
            price,
            totalOffers,
            status,
            pickUpAddress,
            pickUpCity,
            pickUpAddressLat,
            pickUpAddressLng,
            pickUpContactPerson,
            pickUpContactNumber,
            pickUpSpecialInstruction,
            dropOffAddress,
            dropOffCity,
            dropOffAddressLat,
            dropOffAddressLng,
            dropOffContactPerson,
            dropOffContactNumber,
            dropOffSpecialInstruction,
            distance,
            serviceProviderId,
            responseStatus,
            notificationOnServiceProvider,
            notificationOnUser,
            serviceProviderActionButtons,
            userActionButtons,
            serviceProviderResponse,
            serviceProviderActionPrice,
            userResponse,
            userResponsePrice,
        } = req.body;

        const postData = {
            userId,
            service,
            postHeading,
            postDescription,
            loadWeight,
            numberOfItems,
            loadImages: [
                { imageUrl }
            ],
            price,
            totalOffers,
            status,
            pickUpAddress,           
            pickUpCity,              
            pickUpAddressLat,        
            pickUpAddressLng,        
            pickUpContactPerson,     
            pickUpContactNumber,     
            pickUpSpecialInstruction,
            dropOffAddress,          
            dropOffCity,             
            dropOffAddressLat,       
            dropOffAddressLng,       
            dropOffContactPerson,    
            dropOffContactNumber,    
            dropOffSpecialInstruction,
            distance,
            response: [{
                serviceProviderId,
                responseStatus,
                notificationOnServiceProvider,
                notificationOnUser,
                serviceProviderActionButtons,
                userActionButtons,
                serviceProviderResponseSchema: [{
                    serviceProviderResponse,
                    serviceProviderActionPrice
                }],
                userResponseSchema: [{
                    userResponse,
                    userResponsePrice
                }]
            }],
            createdAt: admin.firestore.FieldValue.serverTimestamp()  // Store the timestamp
        };
        
        const newPostRef = await firestore.collection('posts').add(postData);
        
        res.status(201).json({ success: true, postId: newPostRef.id, post: postData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

//=============================get all posts for testing ===========================================//
const getAll = async (req, res) => {
    try {
        const snapshot = await firestore.collection('posts').get();
        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//=============================delete all posts for testing ===========================================//
const deleteAll = async (req, res) => {
    try {
        const batch = firestore.batch();
        const snapshot = await firestore.collection('posts').get();

        if (snapshot.empty) {
            return res.status(404).json({ message: 'No posts found to delete' });
        }

        // Firestore limits batch size to 500 writes
        let count = 0;
        let batchCount = 0;

        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
            count++;

            // Commit the batch every 500 deletes
            if (count % 500 === 0) {
                batch.commit();  // Commit current batch
                batchCount++;
                batch = firestore.batch(); // Create new batch
            }
        });

        // Commit any remaining documents in the batch
        if (count % 500 !== 0) {
            await batch.commit();
        }

        res.status(200).json({ message: `All posts deleted successfully in ${batchCount + 1} batches` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


//=========================== To get all posts posted by user on user app ==========================//
const getPostsByUid = async (req, res) => {
    const id = req.params.uid; // Get the user ID from the request parameters
    try {
        const postsSnapshot = await firestore.collection('posts').where('userId', '==', id).get(); // Query Firestore for posts

        // Check if the snapshot is empty
        if (postsSnapshot.empty) {
            return res.status(404).json({ message: 'No posts found for this user.' });
        }

        // Map the documents to an array
        const posts = postsSnapshot.docs.map(doc => ({
            id: doc.id, // Include the document ID
            ...doc.data() // Spread the document data
        }));

        res.status(200).json(posts); // Send the posts in the response
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handle errors
    }
};

//========================== To get user's posts by location on user app ===========================//
const getPostsByIdAndLocation = async (req, res) => {
    const id = req.params.uid;
    const location = req.params.location;

    try {
        // Query Firestore to get posts for the specified user and location
        const postsSnapshot = await firestore.collection('posts')
            .where('userId', '==', id)
            .where('pickUpCity', '==', location)
            .get();

        // Check if any posts were found
        if (postsSnapshot.empty) {
            return res.status(404).json({ message: 'No posts found for this user and location.' });
        }

        // Map the posts to include their IDs and data
        const posts = postsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        // Send the response back to the client
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//========================= To get user's posts by service on user app ==============================//
const getPostsByIdAndService = async (req, res) => {
    const id = req.params.uid;
    const service = req.params.service;

    try {
        // Query Firestore to get posts for the specified user and service
        const postsSnapshot = await firestore.collection('posts')
            .where('userId', '==', id)
            .where('service', '==', service)
            .get();

        // Check if any posts were found
        if (postsSnapshot.empty) {
            return res.status(404).json({ message: 'No posts found for this user and service.' });
        }

        // Map the posts to include their IDs and data
        const posts = postsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        // Send the response back to the client
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//================================= Delete post on user app =========================================// 
const deleteOnePost = async (req, res) => {
    const id = req.params.postId;
    console.log('delete post id', id);

    try {
        // Get the post from Firestore
        const postRef = firestore.collection('posts').doc(id);
        const postDoc = await postRef.get();

        // Check if the post exists
        if (!postDoc.exists) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const postData = postDoc.data();

        // Check if the post is in an active status
        if (['Available', 'Negotiating'].includes(postData.status)) {
            await postRef.delete(); // Delete the post
            res.status(200).json("Post deleted");
        } else {
            res.status(200).json("This post is already accepted. You cannot delete it!");
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//==================================== Edit post on user app ========================================//
const updateOnePost = async (req, res) => {
    const id = req.params.postId;

    try {
        const postRef = firestore.collection('posts').doc(id);
        const postDoc = await postRef.get();

        // Check if the post exists
        if (!postDoc.exists) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const postData = postDoc.data();

        // Check if the post is in an active status
        if (['Available', 'Negotiating'].includes(postData.status)) {
            const {
                postHeading,
                postDescription,
                loadWeight,
                numberOfItems,
                price,
                pickUpAddress,
                pickUpCity,
                pickUpAddressLat,
                pickUpAddressLng,
                pickUpContactPerson,
                pickUpContactNumber,
                pickUpSpecialInstruction,
                dropOffAddress,
                dropOffCity,
                dropOffAddressLat,
                dropOffAddressLng,
                dropOffContactPerson,
                dropOffContactNumber,
                dropOffSpecialInstruction,
                distance
            } = req.body;

            // Update the post in Firestore
            await postRef.update({
                postHeading,
                postDescription,
                loadWeight,
                numberOfItems,
                price,
                pickUpAddress,
                pickUpCity,
                pickUpAddressLat,
                pickUpAddressLng,
                pickUpContactPerson,
                pickUpContactNumber,
                pickUpSpecialInstruction,
                dropOffAddress,
                dropOffCity,
                dropOffAddressLat,
                dropOffAddressLng,
                dropOffContactPerson,
                dropOffContactNumber,
                dropOffSpecialInstruction,
                distance
            });

            res.status(200).json('Post updated');
        } else {
            res.status(403).json("This post is already accepted. You cannot edit it!");
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//SK - to change job status to "in progress" once driver is en route
const changeJobStatusToDriving = async (req, res) => {
    const id = req.params.postId;

    try {
        const postRef = firestore.collection('posts').doc(id);
        const postDoc = await postRef.get();

        // Check if the post exists
        if (!postDoc.exists) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Update the status to "In Progress"
        await postRef.update({
            status: "In Progress"
        });

        res.status(200).json('Status updated to driving');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//================================ To change post visibilty on both apps =============================//
// generate accepted price and service provider id
const updatePostVisibility = async (req, res) => {
    const id = req.params.postId;
    const {
        price,
        serviceProviderId
    } = req.body;

    try {
        const postRef = firestore.collection('posts').doc(id);
        const postDoc = await postRef.get();

        // Check if the post exists
        if (!postDoc.exists) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Update the post visibility
        await postRef.update({
            show: false,
            status: "Awaiting Payment",
            acceptedPrice: price,
            acceptedServiceProvider: serviceProviderId
        });

        res.status(200).json('Visibility updated');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//============================= To get single post by post Id on both apps ==========================//
const getOnePost = async (req, res) => {
    const postId = req.params.postId;

    try {
        const postRef = firestore.collection('posts').doc(postId);
        const postDoc = await postRef.get();

        // Check if the post exists
        if (!postDoc.exists) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Return the post data
        res.status(200).json({ id: postDoc.id, ...postDoc.data() });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//======================== To get all Active posts on service provider app ==========================//
const getAllPosts = async (req, res) => {
    try {
        const postsSnapshot = await firestore.collection('posts').where('show', '==', true).get();

        // Check if there are any posts
        if (postsSnapshot.empty) {
            return res.status(404).json({ message: 'No posts found.' });
        }

        // Map the posts data to an array
        const posts = postsSnapshot.docs.map(doc => ({
            id: doc.id, 
            ...doc.data() 
        }));

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//======================= To get Active posts by location on service provider app ====================//
const getPostsByLocation = async (req, res) => {
    const location = req.params.location;
    try {
        // Reference to the 'posts' collection in Firestore
        const postsRef = firestore.collection('posts');

        // Query to get posts where 'show' is true and 'pickUpCity' matches the location
        const snapshot = await postsRef.where('show', '==', true).where('pickUpCity', '==', location).get();

        // Check if there are any posts and create an array of the results
        if (snapshot.empty) {
            return res.status(404).json({ message: 'No posts found' });
        }

        const posts = snapshot.docs.map(doc => ({
            id: doc.id, // Include the document ID
            ...doc.data(), // Spread the document data
        }));

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//======================= To get Active Jobs by service on service provider app ======================//
const getPostsByService = async (req, res) => {
    const service = req.params.service;
    try {
        // Reference to the 'posts' collection in Firestore
        const postsRef = firestore.collection('posts');

        // Query to get posts where 'show' is true and 'service' matches the provided service
        const snapshot = await postsRef.where('show', '==', true).where('service', '==', service).get();

        // Check if there are any posts and create an array of the results
        if (snapshot.empty) {
            return res.status(404).json({ message: 'No posts found' });
        }

        const posts = snapshot.docs.map(doc => ({
            id: doc.id, // Include the document ID
            ...doc.data(), // Spread the document data
        }));

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//=========================== To get all post by serviceProviderId ===================================//
const getPostsByServiceProviderId = async (req, res) => {
    try {
        const serviceProviderId = req.params.serviceProviderId;
        const postsRef = firestore.collection('posts');

        // Query to get posts where 'response.serviceProviderId' matches the provided ID
        const snapshot = await postsRef.where('response.serviceProviderId', '==', serviceProviderId).get();

        // Check if there are any posts and create an array of the results
        if (snapshot.empty) {
            return res.status(404).json({ message: 'No posts found for this service provider' });
        }

        const posts = snapshot.docs.map(doc => ({
            id: doc.id, // Include the document ID
            ...doc.data(), // Spread the document data
        }));

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//=================== To get all post by serviceProviderId and service ==============================//
const getPostsByServiceProviderAndService = async (req, res) => {
    try {
        const service = req.params.service;
        const serviceProviderId = req.params.serviceProviderId;
        const postsRef = firestore.collection('posts');

        // Query to get posts where 'response.serviceProviderId' matches the provided ID and service matches the provided service
        const snapshot = await postsRef
            .where('response.serviceProviderId', '==', serviceProviderId)
            .where('service', '==', service)
            .get();

        // Check if there are any posts and create an array of the results
        if (snapshot.empty) {
            return res.status(404).json({ message: 'No posts found for this service provider and service' });
        }

        const posts = snapshot.docs.map(doc => ({
            id: doc.id, // Include the document ID
            ...doc.data(), // Spread the document data
        }));

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//=================== To get all post by serviceProviderId and location ==============================//
const getPostsByServiceProviderIdAndLocation = async (req, res) => {
    try {
        const location = req.params.location;
        const serviceProviderId = req.params.serviceProviderId;
        const postsRef = firestore.collection('posts');

        // Query to get posts where 'response.serviceProviderId' matches the provided ID and 'pickUpCity' matches the location
        const snapshot = await postsRef
            .where('response.serviceProviderId', '==', serviceProviderId)
            .where('pickUpCity', '==', location)
            .get();

        // Check if there are any posts and create an array of the results
        if (snapshot.empty) {
            return res.status(404).json({ message: 'No posts found for this service provider in the specified location' });
        }

        const posts = snapshot.docs.map(doc => ({
            id: doc.id, 
            ...doc.data(), 
        }));

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//==================== To add service provider response on service provider app ======================//

const addServiceProviserResponse = async (req, res) => {
    const {
        status,
        postId,
        serviceProviderId,
        responseStatus,
        serviceProviderActionButtons,
        serviceProviderResponse,
        serviceProviderActionPrice,
        userActionButtons
    } = req.body;

    const postRef = firestore.collection('posts').doc(postId);
    const postDoc = await postRef.get();

    let activePost = postDoc.exists && ['Available', 'Negotiating'].includes(postDoc.data().status);

    if (activePost) {
        const existedResponse = postDoc.data().response.filter(r => r.serviceProviderId === serviceProviderId);
        const incrementValue = status === 'Declined' ? -1 : existedResponse.length > 0 ? 0 : 1;

        if (existedResponse.length > 0) {
            try {
                await postRef.update({
                    'response': admin.firestore.FieldValue.arrayUnion({
                        serviceProviderId,
                        serviceProviderResponseSchema: [{ serviceProviderResponse, serviceProviderActionPrice }],
                        responseStatus,
                        serviceProviderActionButtons,
                        notificationOnServiceProvider: 'none',
                        notificationOnUser: 'flex',
                        userActionButtons
                    }),
                    status: status,
                    totalOffers: admin.firestore.FieldValue.increment(incrementValue)
                });
                res.status(200).json("Response sent");
            } catch (error) {
                res.status(404).json({ message: error.message });
            }
        } else {
            try {
                await postRef.update({
                    'response': admin.firestore.FieldValue.arrayUnion({
                        serviceProviderId,
                        responseStatus,
                        notificationOnServiceProvider: 'none',
                        notificationOnUser: 'flex',
                        serviceProviderActionButtons,
                        userActionButtons,
                        serviceProviderResponseSchema: [{ serviceProviderResponse, serviceProviderActionPrice }],
                    }),
                    totalOffers: admin.firestore.FieldValue.increment(incrementValue),
                    status: status
                });
                res.status(200).json("Response sent");
            } catch (error) {
                res.status(404).json({ message: error.message });
            }
        }
    } else {
        res.status(200).json("This post is not available");
    }
};

//================================= To add user response on user app ================================//
const addUserResponse = async (req, res) => {
    const {
        status,
        postId,
        serviceProviderId,
        responseStatus,
        // notificationOnServiceProvider,
        // notificationOnUser,
        serviceProviderActionButtons,
        userResponse,
        userResponsePrice,
        userActionButtons
    } = req.body
    //only need to change number of offers for user if they are declining a service provider offer - users cannot initiate offers
    const incrementValue = status === 'Declined' ? -1 : 0
    const postRef = firestore.collection('posts').doc(postId);
    const postDoc = await postRef.get();

    let activePost = postDoc.exists && ['Available', 'Negotiating'].includes(postDoc.data().status);

    if (!!activePost) {
        try {
            await postRef.update({
                'response': admin.firestore.FieldValue.arrayUnion({
                    serviceProviderId,
                    responseStatus,
                    serviceProviderResponseSchema: [{
                        serviceProviderResponse,
                        serviceProviderActionPrice
                    }],
                    serviceProviderActionButtons,
                    notificationOnServiceProvider: 'none',
                    notificationOnUser: 'flex',
                    userActionButtons
                }),
                status: status,
                totalOffers: admin.firestore.FieldValue.increment(incrementValue)
            });
            
            res.status(200).json({ message: 'User response added' });
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    } else {
        res.status(200).json("This post is not available")
    }
}

//=================== To get response by serviceProviderId on serviceProvider App =====================//
const getResponseByServiceProviderId = async (req, res) => {
    try {
        const postId = req.params.postId;
        const serviceProviderId = req.params.serviceProviderId;
        
        // Get the post from Firestore
        const postRef = firestore.collection('posts').doc(postId);
        const postDoc = await postRef.get();

        // Check if the post exists
        if (!postDoc.exists) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const postData = postDoc.data();
        const response = postData.response.find(r => r.serviceProviderId === serviceProviderId);

        // Check if the response exists
        if (!response) {
            return res.status(404).json({ message: 'No response found for this service provider.' });
        }

        // Return the found response
        res.status(200).json(response);

    } catch (error) {
        console.error(error);  // Log the error for debugging
        res.status(500).json({ message: error.message });
    }
};

//================================= To Delete Response on both apps====================================//
const deleteResponse = async (req, res) => {
    const { postId, responseId } = req.params;

    try {
        const postRef = firestore.collection('posts').doc(postId);
        const postDoc = await postRef.get();

        if (!postDoc.exists) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const postData = postDoc.data();
        const updatedResponse = postData.response.filter(r => r._id !== responseId);

        await postRef.update({ response: updatedResponse });

        res.status(200).json({ message: "Response deleted" });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};


//Neeraj  - send live gps cordinates to database
const postGpsCordinates = async (req, res) => {
    try {
        const id = req.params.postId;
        const { latitude, longitude } = req.body

        console.log("called the server")
        console.log(req.body)
        const postRef = firestore.collection('posts').doc(id);
await postRef.update({
    driverLat: latitude,
    driverLong: longitude
});

res.status(200).json('GPS Data Posted Successfully');

        res.status(200).json('Gps Data Posted Sucessfully')
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

//Neeraj  - Update post status on Driver arrival

const markDriverArrival = async (req, res) => {
    try {
        const id = req.params.postId;

        const postRef = firestore.collection('posts').doc(id);
await postRef.update({
    status: "Driver Arrived"
});

res.status(200).json('Status Updated Successfully');

        res.status(200).json('Status Updated Sucesssfully')
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}
//============================== To mark job as paid==============================
const markJobPaid = async (req, res) => {
    try {
        const id = req.params.postId;

        const postRef = firestore.collection('posts').doc(id);
        await postRef.update({
            status: "Paid"
        });

        res.status(200).json('Status Updated Sucesssfully')
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

//Neeraj  - Update post status on Driver arrival

const markJobComplete = async (req, res) => {
    try {
        const id = req.params.postId;

        const postRef = firestore.collection('posts').doc(id);
        await postRef.update({
            status: "Complete"
        });

        res.status(200).json('Status Updated Sucesssfully')
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

//===================================================================================================//
exports.getAllPosts = getAllPosts;
exports.getPostsByUid = getPostsByUid;
exports.getOnePost = getOnePost;
exports.createPost = createPost;
exports.deleteOnePost = deleteOnePost;
exports.updateOnePost = updateOnePost;
exports.updatePostVisibility = updatePostVisibility;
exports.getPostsByService = getPostsByService;
exports.getPostsByLocation = getPostsByLocation;
exports.getPostsByIdAndService = getPostsByIdAndService;
exports.getPostsByIdAndLocation = getPostsByIdAndLocation;
exports.addServiceProviserResponse = addServiceProviserResponse;
exports.addUserResponse = addUserResponse;
exports.getResponseByServiceProviderId = getResponseByServiceProviderId;
exports.deleteResponse = deleteResponse;
exports.getPostsByServiceProviderId = getPostsByServiceProviderId;
exports.getPostsByServiceProviderAndService = getPostsByServiceProviderAndService;
exports.getPostsByServiceProviderIdAndLocation = getPostsByServiceProviderIdAndLocation;
exports.getAll = getAll;
exports.deleteAll = deleteAll;
exports.changeJobStatusToDriving = changeJobStatusToDriving;
exports.postGpsCordinates = postGpsCordinates;
exports.markDriverArrival = markDriverArrival;
exports.markJobPaid = markJobPaid;
exports.markJobComplete = markJobComplete;
