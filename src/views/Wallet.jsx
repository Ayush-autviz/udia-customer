import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, FlatList, StatusBar } from 'react-native';
import Icon, { Icons } from '../components/Icons';
import * as colors from '../assets/css/Colors';
import { app_name, light, regular, bold, home_banner, wallet, wallet_money, get_payment_type, api_url, img_url, get_wallet_list, add_wallet } from '../config/Constants';
import DropShadow from "react-native-drop-shadow";
import { useNavigation } from '@react-navigation/native';
import RBSheet from "react-native-raw-bottom-sheet";
//import RazorpayCheckout from 'react-native-razorpay';
import DialogInput from 'react-native-dialog-input';
import {  useStripe } from '@stripe/stripe-react-native';
import axios from 'axios';
import { Loader } from '../components/Loader';
import Moment from 'moment';
import RazorpayCheckout from 'react-native-razorpay';

const Wallet = () => {
  const navigation = useNavigation(); 
  const [loading, setLoading] = useState(false)
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [amount, setAmount] = useState(0); 
  const wallet_ref = useRef(null);
  const [payment_methods, setPaymentMethod] = useState([]);
  const [wallet_amount, setWalletAmount] = useState(0);  
  const [wallet_history, setWalletHistory] = useState([]);  
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(() => {
     // const unsubscribe = navigation.addListener('focus', async () => {
       // await
         get_payment_methods();
     //   await 
        get_wallet();
     // });
     // return unsubscribe;
  },[]);

  const get_payment_methods = async () => {
    setLoading(true);
    console.log(api_url + get_payment_type)
    await axios({
      method: 'post', 
      url: api_url + get_payment_type,
      data:{ type:2, customer_id : global.id }
    })
    .then(async response => {
      setLoading(false);
      setPaymentMethod(response.data.result.payment_modes);
    })
    .catch(error => {
      setLoading(false);
      alert('Sorry something went wrong');
    });
  }

  const walletreferance = async() => {
    try{
        await setTimeout(() => {
          wallet_ref.current.focus();
        }, 200);
      }catch (e) {
        alert(e);
    }
  }

  const handleBackButtonClick= () => {
    navigation.goBack()
  }

  const open_dialog = () =>{
    setDialogVisible(true);
  }

  const close_dialogbox = () =>{
    setDialogVisible(false);
  }

  const choose_payment = async(total_fare) =>{
    if(total_fare == '' || total_fare == undefined){
      alert('Please enter the amount')
    }else{
      await setDialogVisible(false);
      await setAmount(total_fare) ;
      await wallet_ref.current.open()
    }
  }

  const select_payment = async (item) =>{
    await payment_done(item.slug);
    await wallet_ref.current.close();
  }

  const payment_done = async(slug) =>{
    console.log(slug,'slug');
    if(slug != ''){
      if(slug == 'razorpay'){
        await razorpay();
      }else if(slug == 'stripe'){
        onCheckout();
      }
    }else{
      alert("Sorry something went wrong");
    }
  }

  const createPaymentIntent = async () => {
    try {
      const response = await axios({
        method: 'post',
        url: api_url + 'customer/stripe_payment',
        data: { amount: amount * 100, customer_id: global.id }
      });
      console.log(response.data, "data response");
      return response.data; // Return the data directly
    } catch (error) {
      setLoading(false);
      console.log(error);
      alert('Sorry something went wrong');
      throw error; // Re-throw the error to handle it in the calling function
    }
  };
  
  const onCheckout = async () => {
    console.log("on check out");
    try {
      // 1. Create a payment intent
      const data = await createPaymentIntent();
      console.log(data.client_secret, "payment intent");
  
      if (!data.success) {
        Alert.alert('Something went wrong', 'Unable to create payment intent');
        return;
      }
      // 2. Initialize the Payment Sheet
      const { error: paymentSheetError } = await initPaymentSheet({
        merchantDisplayName: 'Food Lakh',
        paymentIntentClientSecret: data.client_secret,
        defaultBillingDetails: {
          // contact: global.phone_with_code,
          name: global.customer_name
        },
      });
      if (paymentSheetError) {
        Alert.alert('Something went wrong', paymentSheetError.message);
        return;
      }
      // 3. Present the Payment Sheet from Stripe
      const { error: paymentError } = await presentPaymentSheet();
      if (paymentError) {
        Alert.alert(`Error code: ${paymentError.code}`, paymentError.message);
        return;
      }else{
        check_add_wallet();
      }
      Alert.alert('Payment Successful', 'Your payment was successful!');
    } catch (error) {
      console.log('Error during checkout:', error);
    }
  };

  const razorpay = async() =>{
   // const amn = 120;
    console.log({currency: global.currency_short_code,
      key: global.razorpay_key,
      amount: amount* 100,
      name: global.app_name,
      prefill:{
        contact: global.phone_with_code,
        name: global.customer_name
      }})
    var options = {
      currency: global.currency_short_code,
      key: global.razorpay_key,
      amount: amount * 100,
      name: global.app_name,
      prefill:{
        contact: global.phone_with_code,
        name: global.customer_name
      },
      theme: {color: colors.theme_fg}
    }
    try {
      const data = await RazorpayCheckout.open(options);
      console.log("Razorpay success data:", data);
      check_add_wallet();
    } catch (error) {
      console.log("Razorpay error:", error);
      alert('Transaction declined');
    }
  }

  // const razorpay = async() =>{
  //   console.log({currency: global.currency_short_code,
  //     key: global.razorpay_key,
  //     amount: props.total * 100,
  //     name: global.app_name,
  //     prefill:{
  //       contact: global.phone_with_code,
  //       name: global.customer_name
  //     }})
  //   var options = {
  //     currency: global.currency_short_code,
  //     key: global.razorpay_key,
  //     amount: props.total * 100,
  //     name: global.app_name,
  //     prefill:{
  //       contact: global.phone_with_code,
  //       name: global.customer_name
  //     },
  //     theme: {color: colors.theme_fg}
  //   }
  //   RazorpayCheckout.open(options).then((data) => {
  //     order_placing();
  //   }).catch((error) => {
  //     alert('Transaction declined');
  //   });
  // }

  const check_add_wallet= async () => {
    setLoading(true);
     await axios({
      method: 'post', 
      url: api_url + add_wallet,
      data:{ id :global.id, country_id:global.country_id, amount:amount}
    })
    .then(async response => {
      setLoading(false);
        await get_wallet();
    })
    .catch(error => {
      setLoading(false);
        alert("Sorry Something went wrong.");
    });
  }
  
  const get_wallet= async () => {
    setLoading(true);
    await axios({
      method: 'post', 
      url: api_url + get_wallet_list,
      data:{ customer_id : global.id }
    })
    .then(async response => {
      setLoading(false);
      setWalletAmount(response.data.result.wallet_amount);
      setWalletHistory(response.data.result.wallets);

    })
    .catch(error => {
      setLoading(false);
      alert('sorry something went wrong');
    });
  }

  const renderItem = ({ item }) => (

    <View style={{ flexDirection:'row',borderBottomWidth:1, borderColor:colors.light_grey, paddingTop:15, paddingBottom:15}}>
      <View style={{ width:'15%',justifyContent:'center', alignItems:'center' }}>
        <Image style={{ height: 30, width: 30 ,}} source={wallet} />
      </View>  
      <View style={{ width:'65%', justifyContent:'center', alignItems:'flex-start'}}>
        <Text style={{ fontFamily:regular, fontSize:14, color:colors.theme_fg_two}}>{item.message}</Text>
      <View style={{ margin:2}} />
        <Text style={{ fontFamily:regular, fontSize:12, color:colors.grey}}>{Moment(item.created_at).format('MMM DD, YYYY hh:mm A')}</Text>   
      </View>
      <View style={{ width:'20%',justifyContent:'center', alignItems:'center'}}>
        <Text style={{ fontFamily:bold, fontSize:16, color:colors.grey}}>{global.currency}{item.amount}</Text>
      </View>  
    </View>
    
  );


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.theme_bg}/>
    <Loader visible={loading}/>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackButtonClick} style={{ width:'15%',justifyContent:'center', alignItems:'flex-start' }}>
            <Icon type={Icons.Ionicons} name="chevron-back-circle-outline" color={colors.theme_fg_two} style={{ fontSize:35 }} />
          </TouchableOpacity>
          <View style={{ width:'75%',justifyContent:'center', alignItems:'flex-start' }}>
            <Text style={{ color:colors.theme_fg_two, fontFamily:bold, fontSize:20 }}>Wallet</Text>
          </View>
        </View> 
        <View style={{ margin:10 }} />
        <DropShadow
          style={{
              width: '100%',
              shadowColor: "#000",
              paddingLeft:10, 
              paddingRight:10, 
              shadowOffset: {
                  width: 0,
                  height: 0,
              },
              shadowOpacity: 0.1,
              shadowRadius: 5,
          }}
        >
          <View style={{ padding:10, borderColor:colors.theme_bg, borderWidth:1, borderRadius:10, flexDirection:'row', paddingTop:15, paddingBottom:15}}>
            <View style={{ width:'15%',justifyContent:'center', alignItems:'flex-start' }}>
              <Image style={{ height: 30, width: 30 ,}} source={wallet} />
            </View>    
            <View style={{ width:'45%', justifyContent:'center', alignItems:'flex-start'}}>
              <Text style={{ fontFamily:bold, fontSize:20, color:colors.theme_fg}}>{global.currency}{wallet_amount}</Text>
            <View style={{ margin:1 }} />
              <Text style={{ fontFamily:regular, fontSize:12, color:colors.grey}}>Your balance</Text>   
            </View>
            <TouchableOpacity onPress={open_dialog} style={{ width:'40%',justifyContent:'center', alignItems:'flex-end'}}>
              <Text style={{borderWidth:1, padding:8, fontFamily:bold, fontSize:12,borderColor:colors.theme_fg_two,color:colors.grey}}>+ Add Money</Text> 
            </TouchableOpacity>  
          </View>
          </DropShadow>
        <View style={{ margin:20 }} />
        <Text style={{ fontFamily:bold, fontSize:18, color:colors.theme_fg_two, padding:10}}>Wallet transactions</Text>
        {wallet_history.length == 0 ?
          <View style={{ alignSelf:'center', justifyContent:'center', marginTop:'50%'}}>
            <Text>Sorry no transaction found yet.</Text>
          </View>
          :
          <FlatList
            data={wallet_history}
            renderItem={renderItem}
            keyExtractor={item => item.id}
          />
        }
      </ScrollView>
      <RBSheet
        ref={wallet_ref}
        height={250}
        animationType="fade"
        duration={250}
      >
      <View style={{ padding:20 }}>
        <View>
          <Text style={{ fontFamily:bold, fontSize:14}}>Select your payment options</Text>
        </View>
      </View>
        <FlatList
          data={payment_methods}
          renderItem={({ item,index }) => (
            <TouchableOpacity style={{ flexDirection:'row', padding:20}} onPress={select_payment.bind(this,item)}>
              <View style={{ width:'20%'}}>
                <Image 
                  style= {{flex:1 ,height:35, width:35 }}
                  source={{ uri : img_url + item.icon }}
                />
              </View>
              <View style={{ width:'80%'}}>
                <Text style={{ fontFamily:regular, fontSize:14, alignItems:'center', justifyContent:'flex-start', color:colors.theme_fg_two}}>{item.payment_name}</Text>
              </View>
            </TouchableOpacity>
            
          )}
          keyExtractor={item => item.id}
        />
      </RBSheet>
      <DialogInput isDialogVisible={isDialogVisible}
          title="Add Wallet"
          message="Please enter your amount"
          hintInput ="Enter Amount"
          textInputProps={{ keyboardType: "numeric" }}
          submitInput={ (inputText) => {choose_payment (inputText)} }
          closeDialog={close_dialogbox}>
          submitText="Submit"
          cancelText="Cancel"
        </DialogInput>
    </SafeAreaView>  
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:colors.theme_bg_three,

  },
  header: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems:'center',
    flexDirection:'row',
    shadowColor: '#ccc',
    padding:10
  },
 
});

export default Wallet;
