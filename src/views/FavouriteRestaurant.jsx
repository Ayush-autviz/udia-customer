import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, FlatList, StatusBar } from 'react-native';
import Icon, { Icons } from '../components/Icons';
import * as colors from '../assets/css/Colors';
import { app_name, light, regular, bold, api_url, get_favourite_restaurant, img_url, empty_favorite_restaurant} from '../config/Constants';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Loader } from '../components/Loader';
import axios from 'axios';
import LottieView from 'lottie-react-native';

const FavouriteRestaurant = () => {

  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [favorite, setFavorite] = useState([]);
  const [count, setCount] = useState([]);

  const handleBackButtonClick= () => {
    navigation.goBack()
  }   

  
    useFocusEffect(
      React.useCallback(() => {
        console.log('usefocus')
        favorite_restaurant();
      }, [])
    );
  

  useEffect( () => {
    const unsubscribe = navigation.addListener('focus', async () => {
      
      favorite_restaurant();
    });
    return unsubscribe;
  },[]);

  const favorite_restaurant = async () => {
    console.log(global.id)
    setLoading(true);
    await axios({
      method: 'post', 
      url: api_url + get_favourite_restaurant,
      data:{customer_id:global.id}
    })
    .then(async response => {
      await setLoading(false);
      if(response.data.status == 1){
        console.log(response.data.result,'result')
        setFavorite(response.data.result);
        setCount(response.data.result.length);  
      }else{
        setFavorite([]);
        setCount(0);
        console.log("else");
        console.log(response,'result else')
        //alert(response.data.message)
      }
      
    })
    .catch(error => {
      setLoading(false);
      alert('Sorry something went wrong')
    });
  }

  const home = (id) =>{
    navigation.navigate("Menu", {restaurant_id:id})
  }

  const renderItem = ({ item }) => (
    <View style={{ padding:10 }}>
      <TouchableOpacity onPress={home.bind(this, item.restaurant_id)} activeOpacity={1} >
      <View  style={{backgroundColor:colors.theme_bg_three,elevation:3,borderRadius:10}} >
            <View style={styles.restaurant_container}>
              <View style={styles.imageView}>
                <Image style= {{ height: undefined,width: undefined,flex: 1,borderTopLeftRadius:10, borderTopRightRadius:10, }} source={{ uri : img_url + item.restaurant_image }} />
              </View> 
              <View style={{ flexDirection:'row', padding:20}}>
                <View style={{ width:'80%', alignItems:'flex-start', justifyContent:'center'}}>
                  <Text style={{ color:colors.theme_fg_two, fontFamily:bold, fontSize:18 }}>{item.restaurant_name}</Text>
                  <View style={{ margin:2 }} />
                  <Text style={{ color:colors.grey, fontFamily:regular, fontSize:12 }}>{item.manual_address}</Text>
                </View>
                {item.overall_rating != 0 &&
                  <View style={{ width:'20%', alignItems:'flex-end', justifyContent:'center'}}>
                    <View style={{ width:50, backgroundColor:'green', padding:5, borderRadius:5, alignItems:'center', justifyContent:'center', flexDirection:'row' }}>
                      <Text style={{ fontSize:12, color:colors.theme_fg_three, fontFamily:bold}}>{item.overall_rating} </Text>
                      <Icon style={{ color:colors.theme_fg_three, fontSize:10 }} type={Icons.Ionicons} name="star" />
                    </View>
                  </View>
                }  
              </View>
            </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.theme_bg}/>
      <ScrollView showsVerticalScrollIndicator={false} style={{padding: 10}}>
      <Loader visible={loading} />
      <View style={{ margin:5 }} />
        <View style={styles.header}>
          <View style={{ width:'100%',justifyContent:'center', alignItems:'flex-start' }}>
            <Text style={{ color:colors.theme_fg_two, fontFamily:bold, fontSize:20 }}>Favourite Restaurants</Text>
          </View>
        </View>
        <View style={{ margin:5 }} />
        {count == 0 ?
          <View style={{marginTop:'30%'}}>
            <View style={{ height:250 }}>
              <LottieView  style={{flex: 1}} source={empty_favorite_restaurant} autoPlay loop />
            </View>
            <Text style={{ alignSelf:'center', fontFamily:bold, fontSize:14, color:colors.grey}}>Sorry no data found</Text>
          </View>
          :
          <FlatList
            data={favorite}
            renderItem={renderItem}
            keyExtractor={item => item.id}
          />
        }
        <View style={{ margin:40 }} />
      </ScrollView>
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
  },
  restaurant_container:{
    borderRadius:10,
  },
  imageView: {
    width: '100%', 
    height:180,
  },
});

export default FavouriteRestaurant;
