import { CCard, CCardBody, CCol, CRow } from '@coreui/react'
import { Button } from 'devextreme-react/button'
import 'devextreme-react/text-area'
import 'devextreme-react/tag-box'
import 'devextreme-react/html-editor'
import 'devextreme-react/lookup'
import 'devextreme-react/date-box'
import 'devextreme/dist/css/dx.light.css'
import Form, {
  ButtonItem,
  GroupItem,
  Item,
  Label,
  RequiredRule,
  SimpleItem,
  Tab,
  TabbedItem,
  TabPanelOptions,
} from 'devextreme-react/form'
import { getSizeQualifier } from 'src/utils/Screen'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { Api_Server_url, post_Image_url } from 'src/shared/shared'
import axios from 'axios'
import { Maincontext } from 'src/context/maincontext'
import { AxiosRequester } from 'src/utils/AxiosRequester'
import DataSource from 'devextreme/data/data_source'

const sizeValues = ['8pt', '10pt', '12pt', '14pt', '18pt', '24pt', '36pt']
const fontValues = [
  'Arial',
  'Courier New',
  'Georgia',
  'Impact',
  'Lucida Console',
  'Tahoma',
  'Times New Roman',
  'Verdana',
]
const headerValues = [false, 1, 2, 3, 4, 5]
const htmlEditorOptions = {
  height: '350px',
  defaultValue: '',
  toolbar: {
    items: [
      'undo',
      'redo',
      'separator',
      { name: 'size', acceptedValues: sizeValues },
      { name: 'font', acceptedValues: fontValues },
      'separator',
      'bold',
      'italic',
      'strike',
      'underline',
      'separator',
      'alignLeft',
      'alignCenter',
      'alignRight',
      'alignJustify',
      'separator',
      'orderedList',
      'separator',
      { name: 'header', acceptedValues: headerValues },
      'separator',
      'color',
      'background',
      'separator',
      'link',
      'image',
      'separator',
      'clear',
      'codeBlock',
      'blockquote',
      'separator',
      'insertTable',
      'deleteTable',
      'insertRowAbove',
      'insertRowBelow',
      'deleteRow',
      'insertColumnLeft',
      'insertColumnRight',
      'deleteColumn',
    ],
  },
  mediaResizing: {
    enabled: true,
  },
}

const CampaignAdd = () => {
  const campaignDataTemlate = {
    rvmId: null,
    title: '',
    startDate: new Date(),
    endDate: new Date(),
    prizeType: 1,
    prizeValue: '',
    dataMtnId: 0,
    dataCellcId: 0,
    dataVodacomId: 0,
    dataTelkomId: 0,
    pushNotificationTitle: '',
    pushNotificationDescription: '',
    winnerRatios: '',
    winnerText: '',
    winnerSmsText: '',
    description: '',
    rules: '',
    campaignRvms: [],
    campaignTypeId: 1,
    shortDescription: '',
    entryNotificationMethod: 0,
    mmsSubject: '',
    userMmsText: '',
    winnerMailCc: '',
    winnerNotificationMethod: 0,
    winnerPushNotificationTitle: '',
    winnerPushNotificationDescription: '',
    groupRvms: false,
    groupSelectedRvms: false,
    repeatRatio: false,
    couponTypeId: 0,
    materialTypes: [],
    campaignBrand: null,
    campaignProduct: 0,
    image: '',
    ledgerimage: '',
    goal: 0,
  }

  const [campaignData, setCampaignData] = useState(campaignDataTemlate)
  const history = useHistory()
  const inputFile = useRef(null)
  const { isLoading, setIsLoading, LogOut, authToken, pushNotification } = useContext(Maincontext)
  const [campaignTypes, setCampaignTypes] = useState([])
  const [rvms, setRvms] = useState([])
  const [coupons, setCoupons] = useState([])
  const [materials, setMaterials] = useState([])
  const [telkomData, setTelkomData] = useState([])
  const [cellCData, setCellCData] = useState([])
  const [mTNData, setMTNData] = useState([])
  const [vodacomData, setVodacomData] = useState([])
  const [products, setProducts] = useState([])
  const [brandList, setBrandList] = useState([])
  const [selectedBrand, setSelectedBrand] = useState(null)
  const imageUrl = post_Image_url
  const url = Api_Server_url
  const options = {
    limit: 500,
    page: 1,
  }
  const BrandtBoxRef = useRef(null)
  const [isProductDisabled, setIsProductDisabled] = useState(true)
  const BrandsDataSource = new DataSource({
    store: brandList,
    paginate: true,
    pageSize: 10,
  })

  const colCountByScreen = {
    xs: 1,
    sm: 2,
    md: 4,
    lg: 4,
  }

  const onCampaignImageLoad = e => {
    let file = document.createElement('input')
    file.type = 'file'
    file.onchange = loadingImageFile
    file.click()
  }

  const loadingImageFile = event => {
    var output = document.getElementById('output')
    output.src = URL.createObjectURL(event.target.files[0])
    // Encode the file using the FileReader API
    const reader = new FileReader()
    reader.onloadend = () => {
      // Use a regex to remove data url part
      const base64String = reader.result.replace('data:', '').replace(/^.+,/, '')
      campaignData.image = base64String
    }
    reader.readAsDataURL(event.target.files[0])
    output.onload = function () {
      URL.revokeObjectURL(output.src) // free memory
    }
  }

  const OnCampaignLedgerImageLoad = e => {
    let file = document.createElement('input')
    file.type = 'file'
    file.onchange = loadLedgerImageFile
    file.click()
  }

  const loadLedgerImageFile = event => {
    var output = document.getElementById('output2')
    output.src = URL.createObjectURL(event.target.files[0])
    // Encode the file using the FileReader API
    const reader = new FileReader()
    reader.onloadend = () => {
      // Use a regex to remove data url part
      const base64String = reader.result.replace('data:', '').replace(/^.+,/, '')
      campaignData.ledgerimage = base64String
    }
    reader.readAsDataURL(event.target.files[0])
    output.onload = function () {
      URL.revokeObjectURL(output.src) // free memory
    }
  }

  const performBack = e => {
    history.goBack()
  }

  const handleSubmit = e => {
    e.preventDefault()
    ValidateTabs()
    if (document.getElementById('MockValidator').value === '1') {
      setIsLoading(true)
      SubmitData()
    } else {
      return
    }
  }

  const RebuildDates = () => {
    try {
      campaignData.startDate =
        campaignData.startDate.getFullYear().toString() +
        '-' +
        (campaignData.startDate.getMonth() + 1).toString() +
        '-' +
        campaignData.startDate.getDate().toString() +
        ' ' +
        '00:00:00'
      campaignData.endDate =
        campaignData.endDate.getFullYear().toString() +
        '-' +
        (campaignData.endDate.getMonth() + 1).toString() +
        '-' +
        campaignData.endDate.getDate().toString() +
        ' ' +
        '23:59:59'
    } catch (error) {
      console.log('Exception on Submit' + error)
    }
  }

  const BuildSaveData = () => {
    if (campaignData.groupRvms) {
      campaignData.groupRvms = 1
    } else {
      campaignData.groupRvms = 0
    }
    if (campaignData.groupSelectedRvms) {
      campaignData.groupSelectedRvms = 1
    } else {
      campaignData.groupSelectedRvms = 0
    }
    if (campaignData.repeatRatio) {
      campaignData.repeatRatio = 1
    } else {
      campaignData.repeatRatio = 0
    }
  }

  const PostCampiagnImages = async () => {
    try {
      const campaignImageResponse = await axios.post(imageUrl, {
        imagedata: campaignData.image,
        module: 'campaigns',
      })
      campaignData.image = campaignImageResponse.data

      const ledgerImageResponse = await axios.post(imageUrl, {
        imagedata: campaignData.ledgerimage,
        module: 'campaigns',
      })
      campaignData.ledgerimage = ledgerImageResponse.data
    } catch (error) {
      console.log(error)
      pushNotification('error')
      setIsLoading(false)
    }
  }

  const SubmitData = async () => {
    try {
      RebuildDates()
      BuildSaveData()
      await PostCampiagnImages()

      const response = await AxiosRequester(url + 'campaigns', 'post', authToken, campaignData, LogOut)
      let campaignInsertedID = response.data.insertId

      for (const campaignDataRvm of campaignData.campaignRvms) {
        const newRow = {
          campaign_fk: campaignInsertedID,
          rvm_fk: campaignDataRvm,
        }
        await AxiosRequester(url + 'pivot/campaignrvm', 'post', authToken, newRow, LogOut)
      }

      for (const material of campaignData.materialTypes) {
        const newRow = {
          campaign_fk: campaignInsertedID,
          material_fk: material,
        }
        await AxiosRequester(url + 'pivot/campaignmaterial', 'post', authToken, newRow, LogOut)
      }

      setIsLoading(false)
      history.goBack()
    } catch (error) {
      console.log('Exception on Submit' + error)
      pushNotification('error')
      setIsLoading(false)
    }
  }
  const ValidateTabs = e => {
    if (
      campaignData.prizeValue === '' &&
      campaignData.dataVodacomId === 0 &&
      campaignData.dataCellcId === 0 &&
      campaignData.dataMtnId === 0 &&
      campaignData.dataTelkomId === 0
    ) {
      document.getElementById('MockValidator').value = ''
      document.getElementById('prizeRequired').className = 'ErrorMessage'
    } else {
      document.getElementById('MockValidator').value = '1'
      document.getElementById('prizeRequired').className = 'Hidden'
    }

    if (
      campaignData.winnerSmsText === '' &&
      campaignData.winnerText === '' &&
      campaignData.winnerMailCc === '' &&
      campaignData.winnerPushNotificationTitle === '' &&
      campaignData.winnerPushNotificationDescription === ''
    ) {
      document.getElementById('MockValidator').value = ''
      document.getElementById('WinnerNotificationRequired').className = 'ErrorMessage'
    } else {
      document.getElementById('MockValidator').value = '1'
      document.getElementById('WinnerNotificationRequired').className = 'Hidden'
    }
  }

  const SetCampaignPrizeType = e => {
    campaignData.prizeType = e.itemIndex + 1
  }

  const SetCampaignWinnerNotificationMode = e => {
    campaignData.winnerNotificationMethod = e.itemIndex
  }

  const LoadComponentsData = async () => {
    try {
      // const campaignTypesResponse = await AxiosRequester(
      //   url + 'simple/campaign/types',
      //   'get',
      //   authToken,
      //   options,
      //   LogOut
      // )
      // setCampaignTypes(campaignTypesResponse.data)

      // const cellDataResponse = await AxiosRequester(url + 'simple/celldata', 'get', authToken, options, LogOut)
      // let cellc = []
      // let vodacom = []
      // let telkom = []
      // let mtn = []
      // cellDataResponse.data.forEach(element => {
      //   switch (element['service_provider_fk']) {
      //     case 1:
      //       telkom.push(element)
      //       break
      //     case 2:
      //       cellc.push(element)
      //       break
      //     case 3:
      //       mtn.push(element)
      //       break
      //     case 4:
      //       vodacom.push(element)
      //       break
      //     default:
      //       break
      //   }
      // })
      // setCellCData(cellc)
      // setTelkomData(telkom)
      // setMTNData(mtn)
      // setVodacomData(vodacom)

      // const couponsResponse = await AxiosRequester(url + 'simple/campaign/coupons', 'get', authToken, options, LogOut)
      // setCoupons(couponsResponse.data)

      // const rvmsResponse = await AxiosRequester(url + 'campaigns_rvms', 'get', authToken, {}, LogOut)
      // setRvms(rvmsResponse.data)

      // const materialResponse = await AxiosRequester(url + 'campaigns_materials', 'get', authToken, {}, LogOut)
      // setMaterials(materialResponse.data)

      const brandsResponse = await AxiosRequester(url + 'campaigns_brands', 'get', authToken, {}, LogOut)
      setBrandList(brandsResponse.data)
    } catch (error) {
      pushNotification('error')
      setIsLoading(false)
      performBack()
    }
  }

  const OnBrandsChange = async e => {
    console.log(e)
    e.event.preventDefault()
    e.event.stopPropagation()
    const brandId = e.value;
    setSelectedBrand(brandId)
    // if (e.value) {
    //   const productsResponse = await AxiosRequester(
    //     url + 'campaigns_products',
    //     'get',
    //     authToken,
    //     { brand_fk: e.value },
    //     LogOut
    //   )
    //   setProducts(productsResponse)
    //   setIsProductDisabled(false)
    // }
  }

  useEffect(() => {
    setIsLoading(true)

    LoadComponentsData().then(response => {
      setIsLoading(false)
    })
  }, [])

  //Triguer on Pryze Data Change
  useEffect(() => {
    if (
      telkomData.length > 0 &&
      vodacomData.length > 0 &&
      cellCData.length > 0 &&
      mTNData.length > 0 &&
      coupons.length > 0
    ) {
      setCampaignData({
        ...campaignData,
        dataTelkomId: telkomData[0].id,
        dataVodacomId: vodacomData[0].id,
        dataCellcId: cellCData[0].id,
        dataMtnId: mTNData[0].id,
        couponTypeId: coupons[0].id,
      })
    }
  }, [telkomData.length, vodacomData.length, cellCData.length, mTNData.length, coupons.length])

  const handleFormDataChanged = useCallback((e) => {
    const _newFormData = {
      dataField: e.dataField,
      value: e.value
    };
    if (_newFormData.dataField == 'campaignBrand') {
      AxiosRequester(url + 'campaigns_products', 'get', authToken, { brand_fk: _newFormData.value }, LogOut).then(
        response => {
          //etProducts(response.data)
          //setIsProductDisabled(false)
        }
      )
    }
  }, [])

  const preventDefaultWrapper = (handler) => {
    console.log(handler)
    return (event) => {
      console.log(event)
      event.preventDefault();
      handler(event);
    };
  };

  return (
    <>
      <CRow>
        <CCol>
          <div className="widget-container">
            <div className="dx-fieldset">
              <h1>New Campaign</h1>
            </div>
          </div>
          <CCard>
            <CCardBody>
              <div style={{ display: 'flex', flexDirection: 'row' }} id="form-demo">
                <div className="widget-container">
                  <input type="file" id="file" ref={inputFile} style={{ display: 'none' }} />
                  <form action="#" onSubmit={handleSubmit}>
                    <input
                      id="MockValidator"
                      type="Text"
                      onChange={() => {}}
                      value="1"
                      required
                      className="Hidden"
                    ></input>
                    <Form
                      id="form"
                      formData={campaignData}
                      showColonAfterLabel
                      labelLocation={'top'}
                      minColWidth={200}
                      colCount={'auto'}
                      screenByWidth={getSizeQualifier}
                      colCountByScreen={colCountByScreen}
                      useSubmitBehavior={false}
                    >
                      <Item
                        dataField="campaignTypeId"
                        colSpan={2}
                        editorType="dxSelectBox"
                        editorOptions={{
                          value: campaignData.campaignTypeId,
                          items: campaignTypes,
                          displayExpr: 'title',
                          valueExpr: 'id',
                        }}
                      />

                      <Item
                        dataField={'title'}
                        colSpan={2}
                        isRequired
                        editorType={'dxTextBox'}
                        editorOptions={{
                          placeholder: 'Provide the title for the campaign',
                        }}
                      />
                      <Item
                        dataField="startDate"
                        colSpan={1}
                        editorType="dxDateBox"
                        editorOptions={{
                          placeholder: 'Select the start date',
                          type: 'date',
                        }}
                        isRequired
                      />
                      <Item
                        dataField="endDate"
                        colSpan={1}
                        editorType="dxDateBox"
                        editorOptions={{
                          placeholder: 'Select the end date',
                          type: 'date',
                        }}
                        isRequired
                      />
                      <Item
                        dataField="shortDescription"
                        colSpan={2}
                        editorType="dxTextArea"
                        editorOptions={{
                          placeholder: 'Provide a short description which will display on the campaign listing page',
                        }}
                      />
                      <Item
                        dataField={'description'}
                        colSpan={4}
                        editorType="dxHtmlEditor"
                        editorOptions={{
                          ...htmlEditorOptions,
                          placeholder: 'Provide a description which will display on the campaign view page',
                        }}
                        isRequired
                      />
                      <Item
                        dataField={'rules'}
                        colSpan={4}
                        editorType="dxHtmlEditor"
                        editorOptions={{
                          ...htmlEditorOptions,
                          placeholder:
                            'Provide a list of rules which will provide information on how to meet the standards to achieve this campaign',
                        }}
                        isRequired
                      />

                      <Item
                        dataField={'winnerRatios'}
                        isRequired
                        label={{ text: 'Winner Ratios (Comma Separated List)' }}
                        editorType="dxTextBox"
                        editorOptions={{
                          placeholder: 'Write the ratio of winners, use a comma to separate the values',
                        }}
                        colSpan={4}
                      />
                      <Item dataField="repeatRatio" editorType="dxCheckBox" colSpan={1} />
                      <Item dataField="groupRvms" label={{ text: 'Group RVMs' }} editorType="dxCheckBox" colSpan={1} />
                      <Item
                        dataField="groupSelectedRvms"
                        label={{ text: 'Group Selected RVMs' }}
                        editorType="dxCheckBox"
                        colSpan={1}
                      />
                      <Item
                        dataField={'goal'}
                        colSpan={1}
                        label={{ text: 'Campaign Recicle Goal' }}
                        editorType="dxTextBox"
                        editorOptions={{
                          placeholder: 'Specify a Goal for the current Campaign',
                        }}
                        isRequired
                      />
                      <GroupItem colSpan={4}>
                        <GroupItem colSpan={4}>
                          <div id="prizeRequired" className="Hidden">
                            The Campaign needs at lease one Prize Type
                          </div>
                        </GroupItem>
                      </GroupItem>
                      <TabbedItem label={{ text: 'Prize Type' }} colSpan={4} isRequired>
                        <TabPanelOptions animationEnabled deferRendering={false} />
                        <Tab title="Custom" icon={'preferences'} onClick={SetCampaignPrizeType}>
                          <SimpleItem
                            dataField={'prizeValue'}
                            label={{ text: 'Prize (Custom)' }}
                            editorType="dxTextBox"
                            editorOptions={{
                              value: campaignData.prizeValue,
                              placeholder: 'Provide a description of the prize the winner will receive',
                            }}
                          />
                        </Tab>
                        <Tab title="Data" icon="square" colCount={4} onClick={SetCampaignPrizeType}>
                          <SimpleItem
                            dataField={'dataVodacomId'}
                            label={{ text: 'Vodacom' }}
                            editorType="dxSelectBox"
                            colSpan={2}
                            editorOptions={{
                              placeholder: 'Select the data prize value for Vodacom users',
                              items: vodacomData,
                              displayExpr: 'description',
                              valueExpr: 'id',
                              defaultValue: 0,
                            }}
                          ></SimpleItem>
                          <SimpleItem
                            dataField={'dataMtnId'}
                            label={{ text: 'MTN' }}
                            editorType="dxSelectBox"
                            colSpan={2}
                            editorOptions={{
                              placeholder: 'Select the data prize value for MTN users',
                              items: mTNData,
                              displayExpr: 'description',
                              valueExpr: 'id',
                              defaultValue: 0,
                            }}
                          />
                          <SimpleItem
                            dataField={'dataCellcId'}
                            label={{ text: 'CellC' }}
                            editorType="dxSelectBox"
                            colSpan={2}
                            editorOptions={{
                              placeholder: 'Select the data prize value for CellC users',
                              items: cellCData,
                              displayExpr: 'description',
                              valueExpr: 'id',
                              defaultValue: 0,
                            }}
                          />
                          <SimpleItem
                            dataField={'dataTelkomId'}
                            label={{ text: 'Telkom' }}
                            editorType="dxSelectBox"
                            colSpan={2}
                            editorOptions={{
                              placeholder: 'Select the data prize value for Telko users',
                              items: telkomData,
                              displayExpr: 'description',
                              valueExpr: 'id',
                              defaultValue: 0,
                            }}
                          />
                        </Tab>
                        <Tab title="Airtime" icon="globe" onClick={SetCampaignPrizeType}>
                          <SimpleItem
                            id={'AirTimeValue'}
                            dataField={'prizeValue'}
                            label={{ text: 'Amount (R Value)' }}
                            editorType="dxTextBox"
                            editorOptions={{
                              placeholder: 'Provide the amount of the prize the winner will receive',
                            }}
                            colSpan={1}
                          />
                        </Tab>
                        <Tab title="Coupon" icon="file" onClick={SetCampaignPrizeType}>
                          <SimpleItem
                            dataField={'couponTypeId'}
                            label={{ text: 'Coupon Type' }}
                            editorType="dxSelectBox"
                            editorOptions={{
                              searchEnabled: true,
                              items: coupons,
                              displayExpr: 'coupon_name',
                              valueExpr: 'id',
                              placeholder: 'Choose the coupon type won',
                            }}
                          >
                            <RequiredRule message={'Coupon Required'} />
                          </SimpleItem>
                        </Tab>
                        <Tab title="Cash" icon="money" onClick={SetCampaignPrizeType}>
                          <SimpleItem
                            dataField={'prizeValue'}
                            label={{ text: 'Amount (R Value)' }}
                            editorType="dxTextBox"
                            editorOptions={{
                              placeholder: 'Provide the amount of the prize the winner will receive',
                            }}
                          />
                        </Tab>
                      </TabbedItem>
                      <Item
                        dataField={'campaignRvms'}
                        label={{ text: 'RVM' }}
                        colSpan={2}
                        editorType="dxTagBox"
                        editorOptions={{
                          placeholder: 'Select RVMs for the Campaign',
                          searchEnabled: true,
                          showSelectionControls: true,
                          items: rvms,
                          displayExpr: 'title',
                          valueExpr: 'id',
                          useSubmitBehavior: false,
                        }}
                      ></Item>
                      <Item
                        dataField="materialTypes"
                        colSpan={2}
                        editorType="dxTagBox"
                        editorOptions={{
                          searchEnabled: true,
                          showSelectionControls: true,
                          items: materials,
                          displayExpr: 'title',
                          valueExpr: 'id',
                          placeholder: 'Select Material Types for the Campaign',
                        }}
                      ></Item>
                      <Item
                        dataField="campaignBrand"
                        colSpan={2}
                        editorType="dxSelectBox"
                        ref={BrandtBoxRef}
                        editorOptions={{
                          searchEnabled: true,
                          dataSource: BrandsDataSource,
                          applyValueMode: 'auto',
                          displayExpr: 'title',
                          valueExpr: 'id',
                          placeholder: 'Select a Brand for the Campaign',
                          useSubmitBehavior: true,
                          onValueChanged: OnBrandsChange,
                        }}
                      />
                      <Item
                        dataField="campaignProduct"
                        colSpan={2}
                        editorType="dxSelectBox"
                        disabled={!selectedBrand}
                        editorOptions={{
                          searchEnabled: true,
                          applyValueMode: 'auto',
                          items: products,
                          displayExpr: 'title',
                          valueExpr: 'id',
                          placeholder: 'Select a Product for the Campaign',
                        }}
                      />

                      <GroupItem colSpan={4}>
                        <GroupItem colSpan={4}>
                          <div id="WinnerNotificationRequired" className="Hidden">
                            The Campaign needs at lease one Winner notification method
                          </div>
                        </GroupItem>
                      </GroupItem>
                      <TabbedItem label={{ text: 'Entry notification method' }} colSpan={4}>
                        <TabPanelOptions
                          onTitleClick={e => {
                            campaignData.entryNotificationMethod = e.itemIndex
                          }}
                          animationEnabled
                          deferRendering={false}
                        />
                        <Tab title="None">
                          <h3>No message will be sent</h3>
                        </Tab>
                        <Tab title="SMS" colCount={4}>
                          <SimpleItem
                            dataField={'smsText'}
                            label={{
                              text: 'This is the text that will be SMSed to the user. You can use the following tags which will be replaced accordingly in the email. {CampaignName}, {firstname}. Example usage: Hello {firstname}, you have been entered into the {CampaignName}. The SMS will look like: Hello John Smith, you have been entered into the CampaignName1.',
                            }}
                            editorType="dxTextArea"
                            editorOptions={{
                              placeholder: 'SMS must not be more than 160 characters',
                            }}
                            colSpan={4}
                          />
                        </Tab>
                        <Tab title="MMS">
                          <SimpleItem
                            dataField={'mmsSubject'}
                            label={{ text: 'MMS Subject' }}
                            editorType="dxTextBox"
                            editorOptions={{
                              placeholder: 'Provide the MMS subject line',
                            }}
                            colSpan={4}
                          />
                          <SimpleItem
                            dataField={'userMmsText'}
                            label={{
                              text: "This is the text that will be MMS to the user. You can use the following tags which will be replaced accordingly in the email. {CampaignName}, {firstname}. Example usage: Hello {firstname}, you've been entered into the {CampaignName}. The MMS will look like: Hello John Smith, you've been entered into the CampaignName1.",
                            }}
                            editorType="dxTextArea"
                            editorOptions={{
                              placeholder: 'MMS must not be more than 160 characters',
                            }}
                            colSpan={4}
                          />
                          <SimpleItem
                            itemType={'button'}
                            buttonOptions={{
                              icon: 'upload',
                              text: 'MMS Image | Max 300Kb',
                              onClick: () => {
                                inputFile.current.click()
                              },
                            }}
                            colSpan={4}
                          />
                        </Tab>
                        <Tab title="Push Notification">
                          <SimpleItem
                            label={{ text: 'Push Notification Title' }}
                            editorType="dxTextBox"
                            editorOptions={{
                              placeholder: 'Provide a push notification title of the prize the winner will receive',
                            }}
                          />
                          <SimpleItem
                            label={{ text: 'Push Notification Description' }}
                            editorType="dxTextBox"
                            editorOptions={{
                              placeholder:
                                'Provide a push notification description of the prize the winner will receive',
                            }}
                          />
                        </Tab>
                        <Tab title="Push Notification or SMS">
                          <SimpleItem
                            label={{ text: 'Push Notification Title' }}
                            editorType="dxTextBox"
                            editorOptions={{
                              placeholder: 'Provide a push notification title of the prize the winner will receive',
                            }}
                          />
                          <SimpleItem
                            label={{ text: 'Push Notification Description' }}
                            editorType="dxTextBox"
                            editorOptions={{
                              placeholder:
                                'Provide a push notification description of the prize the winner will receive',
                            }}
                          />
                          <SimpleItem
                            label={{
                              text: 'This is the text that will be SMSed to the user. You can use the following tags which will be replaced accordingly in the email. {CampaignName}, {firstname}. Example usage: Hello {firstname}, you have been entered into the {CampaignName}. The SMS will look like: Hello John Smith, you have been entered into the CampaignName1.',
                            }}
                            editorType="dxTextArea"
                            editorOptions={{
                              placeholder: 'SMS must not be more than 160 characters',
                            }}
                            colSpan={4}
                          />
                        </Tab>
                        <Tab title="Push Notification or MMS">
                          <SimpleItem
                            label={{ text: 'Push Notification Title' }}
                            editorType="dxTextBox"
                            editorOptions={{
                              placeholder: 'Provide a push notification title of the prize the winner will receive',
                            }}
                          />
                          <SimpleItem
                            label={{ text: 'Push Notification Description' }}
                            editorType="dxTextBox"
                            editorOptions={{
                              placeholder:
                                'Provide a push notification description of the prize the winner will receive',
                            }}
                          />
                          <SimpleItem
                            label={{ text: 'MMS Subject' }}
                            editorType="dxTextBox"
                            editorOptions={{
                              placeholder: 'Provide the MMS subject line',
                            }}
                            colSpan={4}
                          />
                          <SimpleItem
                            itemType={'button'}
                            buttonOptions={{
                              icon: 'upload',
                              text: 'MMS Image | Max 300Kb',
                              onClick: () => {
                                inputFile.current.click()
                              },
                            }}
                            colSpan={4}
                          />
                        </Tab>
                      </TabbedItem>
                      <TabbedItem label={{ text: 'Winner notification method' }} isRequired colSpan={4}>
                        <TabPanelOptions animationEnabled deferRendering={false} />
                        <Tab title="SMS" onClick={SetCampaignWinnerNotificationMode}>
                          <SimpleItem
                            onChange={ValidateTabs}
                            label={{
                              text: 'Winner SMS Text',
                            }}
                            dataField="winnerSmsText"
                            editorType="dxTextArea"
                            editorOptions={{
                              placeholder:
                                'Provide the SMS to be sent to the winner. It must not be more than 160 characters',
                            }}
                            colSpan={4}
                          />
                        </Tab>
                        <Tab title="SMS and Email" colCount={4} onClick={SetCampaignWinnerNotificationMode}>
                          <SimpleItem
                            label={{
                              text: 'This is the text that will be emailed to the winner. You can use the following tags which will be replaced accordingly in the email. {code}, {firstname}, {lastname}. Example usage: Congratulations {firstname} {lastname}, you won! Your reference code: {code} The email will look like: Congratulations John Soap, you won! Your reference code: 8hJ3sa',
                            }}
                            dataField="winnerText"
                            editorType="dxTextArea"
                            colSpan={4}
                          />
                          <SimpleItem
                            label={{
                              text: 'Winner Mail CC',
                            }}
                            dataField="winnerMailCc"
                            editorType="dxTextBox"
                            editorOptions={{
                              placeholder:
                                'Provide a list of comma separated addresses which will be notified of winners',
                            }}
                            colSpan={4}
                          />
                          <SimpleItem
                            label={{
                              text: 'Winner SMS Text',
                            }}
                            editorType="dxTextArea"
                            dataField="winnerSmsText"
                            editorOptions={{
                              placeholder:
                                'Provide the SMS to be sent to the winner. It must not be more than 160 characters',
                            }}
                            colSpan={4}
                          />
                        </Tab>
                        <Tab title="SMS or Email" onClick={SetCampaignWinnerNotificationMode}>
                          <SimpleItem
                            label={{
                              text: 'This is the text that will be emailed to the winner. You can use the following tags which will be replaced accordingly in the email. {code}, {firstname}, {lastname}. Example usage: Congratulations {firstname} {lastname}, you won! Your reference code: {code} The email will look like: Congratulations John Soap, you won! Your reference code: 8hJ3sa',
                            }}
                            dataField="winnerText"
                            editorType="dxTextArea"
                            colSpan={4}
                          />
                          <SimpleItem
                            label={{
                              text: 'Winner Mail CC',
                            }}
                            editorType="dxTextBox"
                            dataField="winnerMailCc"
                            editorOptions={{
                              placeholder:
                                'Provide a list of comma separated addresses which will be notified of winners',
                            }}
                            colSpan={4}
                          />
                          <SimpleItem
                            label={{
                              text: 'Winner SMS Text',
                            }}
                            editorType="dxTextArea"
                            dataField="winnerSmsText"
                            editorOptions={{
                              placeholder:
                                'Provide the SMS to be sent to the winner. It must not be more than 160 characters',
                            }}
                            colSpan={4}
                          />
                        </Tab>
                        <Tab title="Push Notification" onClick={SetCampaignWinnerNotificationMode}>
                          <SimpleItem
                            label={{ text: 'Winner Push Notification Title' }}
                            editorType="dxTextBox"
                            dataField="winnerPushNotificationTitle"
                            editorOptions={{
                              placeholder: 'Provide a push notification title of the prize the winner will receive',
                            }}
                          />
                          <SimpleItem
                            label={{ text: 'Winner Push Notification Description' }}
                            editorType="dxTextBox"
                            dataField="winnerPushNotificationDescription"
                            editorOptions={{
                              placeholder:
                                'Provide a push notification description of the prize the winner will receive',
                            }}
                          />
                        </Tab>
                        <Tab title="Push Notification or SMS" onClick={SetCampaignWinnerNotificationMode}>
                          <SimpleItem
                            label={{ text: 'Winner Push Notification Title' }}
                            editorType="dxTextBox"
                            dataField="winnerPushNotificationTitle"
                            editorOptions={{
                              placeholder: 'Provide a push notification title of the prize the winner will receive',
                            }}
                          />
                          <SimpleItem
                            label={{ text: 'Winner Push Notification Description' }}
                            editorType="dxTextBox"
                            dataField="winnerPushNotificationDescription"
                            editorOptions={{
                              placeholder:
                                'Provide a push notification description of the prize the winner will receive',
                            }}
                          />
                          <SimpleItem
                            label={{
                              text: 'Winner SMS Text',
                            }}
                            editorType="dxTextArea"
                            dataField="winnerSmsText"
                            editorOptions={{
                              placeholder:
                                'Provide the SMS to be sent to the winner. It must not be more than 160 characters',
                            }}
                            colSpan={4}
                          />
                        </Tab>
                      </TabbedItem>
                      <GroupItem colSpan={4} cssClass="CampaignMedia">
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <div>Campaign Image (1600 x 900 | 10mb max, JPEG)</div>
                          <img
                            id="output"
                            style={{
                              maxWidth: '100%',
                              height: 'auto',
                              width: 'auto',
                              border: 1,
                              color: 'blue',
                              borderStyle: 'solid',
                            }}
                            width={1000}
                            height={173}
                          ></img>
                          <Button
                            onClick={onCampaignImageLoad}
                            style={{ marginTop: 8, maxWidth: 128 }}
                            type="default"
                            text="Upload"
                          ></Button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
                          <div>Campaign Ledger Image (300 x 300 | 10mb max, JPEG)</div>
                          <img
                            id="output2"
                            style={{
                              maxWidth: '100%',
                              height: 'auto',
                              width: 'auto',
                              border: 1,
                              color: 'blue',
                              borderStyle: 'solid',
                            }}
                            width={1000}
                            height={173}
                          ></img>
                          <Button
                            onClick={OnCampaignLedgerImageLoad}
                            style={{ marginTop: 8, maxWidth: 128 }}
                            type="default"
                            text="Upload"
                          ></Button>
                        </div>
                      </GroupItem>
                      <GroupItem cssClass={'TabButtonsCellLeft'}>
                        <ButtonItem
                          name={'btnSave'}
                          horizontalAlignment={'center'}
                          verticalAlignment={'center'}
                          buttonOptions={{
                            text: 'Save',
                            type: 'success',
                            useSubmitBehavior: true,
                            onClick: ValidateTabs,
                          }}
                        ></ButtonItem>
                      </GroupItem>
                      <GroupItem cssClass={'TabButtonsCellMiddle'}>
                        <ButtonItem
                          name={'btnCancel'}
                          horizontalAlignment={'center'}
                          verticalAlignment={'center'}
                          buttonOptions={{
                            text: 'Cancel',
                            type: 'normal',
                            useSubmitBehavior: false,
                            onClick: performBack,
                          }}
                        ></ButtonItem>
                      </GroupItem>
                    </Form>
                  </form>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default CampaignAdd
