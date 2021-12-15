import React from 'react';

import Typography from '@mui/material/Typography';

import {Region} from '../components/ui/AppUI';

import hero from '../res/images/hero.jpg';
import AlbumCarousel from "../components/album/AlbumCarousel";

const HomePage = () => (
  <>
    <Region name="hero">
      <img src={hero} style={{ width: '100%' }} alt="Hero" />
    </Region>

    <AlbumCarousel albums={[{}, {}, {}, {}, {}, {}]} title="Recente albums" />
    <AlbumCarousel albums={null} title="Recente albums" />

    <Typography>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum feugiat tristique nisi quis molestie.
      Vestibulum vel rutrum lorem. Integer tristique et justo a semper. Vivamus bibendum ornare efficitur. Nam
      pellentesque suscipit lacus. Nam scelerisque justo a mi luctus fermentum. Nulla porttitor dignissim magna et
      pellentesque. Vivamus quis interdum risus. Quisque eros erat, accumsan nec dictum non, mattis eget lorem. Nulla
      elementum tempus felis sit amet pulvinar.

      Curabitur dignissim dapibus nisl, ac ultrices erat ornare in. Maecenas pharetra augue quis turpis molestie
      malesuada. Mauris sit amet fringilla velit. Nam pretium aliquam lorem, vel interdum orci rhoncus ac. Praesent
      dictum facilisis justo, at tempor turpis rutrum vel. Proin aliquam ligula ut elit pretium convallis. Nulla vitae
      mauris lectus. In vitae cursus est. Aenean fringilla at dolor porta iaculis. Vivamus efficitur et nulla volutpat
      mattis. Pellentesque ac sem neque.

      Ut auctor sed elit quis pellentesque. Donec eu dictum dui. Etiam venenatis et tellus sit amet molestie. In vel
      lacinia diam. Maecenas ultrices mollis nisl id convallis. Integer faucibus feugiat molestie. Cras feugiat
      porttitor purus, sed malesuada ligula. Suspendisse pretium lorem nisi, id elementum ex sagittis vel. Quisque in
      metus in nibh dignissim faucibus.

      Sed vestibulum urna non orci lacinia, finibus egestas ligula laoreet. Maecenas ac nisl non justo laoreet
      sollicitudin. Duis eget mauris lobortis, suscipit urna sed, ultricies orci. Ut sit amet laoreet purus. Curabitur
      et tincidunt diam, ac malesuada sapien. Phasellus neque metus, aliquet ac erat nec, mollis cursus dui. Sed ligula
      elit, egestas nec dolor mollis, dictum vehicula justo. Curabitur ultricies massa orci, in pharetra orci pulvinar
      non. Fusce ornare commodo elit at maximus. Pellentesque eget tortor augue. Vivamus mollis scelerisque elit sit
      amet ullamcorper. Suspendisse in lorem sapien. Sed lobortis dictum efficitur. Suspendisse vel neque nulla.

      In sit amet nisi ac nisl hendrerit lacinia in ac odio. Curabitur sit amet rutrum purus, sit amet condimentum nisl.
      Aliquam et ligula nulla. Etiam auctor felis nunc, ut tincidunt justo posuere eu. Mauris ultrices convallis tellus.
      Cras vitae quam luctus, vestibulum libero id, posuere velit. Integer eleifend tortor id imperdiet consequat. Sed
      dignissim diam vel felis cursus ultricies. Ut vel blandit nunc, suscipit interdum metus.

      Proin tempus a arcu non sagittis. Donec eleifend eget ante a sollicitudin. Aliquam varius neque nisl, quis
      accumsan ante bibendum ut. Vivamus enim dui, malesuada ut risus at, varius dapibus risus. Donec vestibulum est vel
      lobortis consequat. Fusce iaculis, elit at pellentesque rutrum, metus diam mollis nulla, at sollicitudin odio sem
      quis nibh. Donec commodo eget odio a tempus. Vestibulum ultrices justo libero.

      Integer non tincidunt mi. Nunc dolor elit, commodo vel mauris eu, varius tristique diam. Sed nec est nisl. Nulla
      porttitor tellus nunc, ut aliquam augue iaculis ac. Nullam sed dapibus mauris, eu lacinia nisl. Integer eleifend
      odio id purus ullamcorper varius. Nunc facilisis faucibus quam vitae consequat. Sed semper eget tortor tristique
      tincidunt. Sed fringilla nulla in pellentesque congue. Cras eleifend, quam eu sodales placerat, orci tortor
      accumsan massa, vitae tempor risus nisl sit amet leo. Quisque at metus ut sapien sagittis rutrum. Class aptent
      taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec et accumsan neque, quis
      elementum orci. Vivamus laoreet, sem sit amet laoreet ullamcorper, nisl eros commodo sem, at tempor lectus neque
      in mauris. Curabitur tempor, elit ut dictum interdum, odio dolor porttitor massa, vestibulum viverra diam ex at
      erat.

      Phasellus ut eros eget erat imperdiet semper eget sed erat. In lacinia lacus ex, sed pellentesque augue elementum
      non. Nullam ac quam ac diam dapibus pulvinar. Nullam sed consequat velit, a vestibulum enim. Sed tristique ante
      sit amet ex convallis, eu ultricies sem placerat. Nam vulputate dignissim convallis. Ut molestie lacus vitae nunc
      vehicula, et semper quam maximus. Praesent mauris velit, luctus at dui nec, luctus luctus diam. Phasellus eleifend
      a augue eget aliquam. Quisque porttitor fermentum eleifend. Vestibulum et justo sit amet eros porta convallis ac
      ut purus. Nam lorem nisl, interdum at erat et, imperdiet venenatis sapien. Sed a convallis nisi. Ut in porta nunc,
      vitae malesuada turpis. Ut neque felis, venenatis nec lacus at, sodales varius justo. Etiam pulvinar justo eget
      dolor ornare, vel ornare nisl mattis.

      Cras interdum neque et ante feugiat, eget sodales enim finibus. Suspendisse mollis dictum arcu, nec tristique
      neque interdum pharetra. Aliquam vestibulum, dui vel elementum auctor, justo nisi dapibus metus, a euismod ligula
      ex eget justo. Curabitur ultricies, libero nec dignissim bibendum, felis quam sagittis metus, eu posuere tellus
      ligula vitae tellus. Sed efficitur rhoncus diam sit amet cursus. Vivamus et blandit tortor, lacinia ullamcorper
      nibh. Aliquam lobortis hendrerit ex, et pretium turpis gravida eget. In ut elit sit amet neque dignissim convallis
      sed a nibh. Curabitur quis suscipit leo. Donec consectetur nisl in lorem maximus scelerisque. Curabitur a interdum
      lacus. In a tristique est. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;
      Donec lacus leo, ultrices quis metus et, pulvinar interdum mi. Nulla hendrerit vel arcu ac scelerisque. Fusce vel
      congue nulla, a consectetur augue.

      Duis ultricies quam quis lacus auctor, a volutpat augue sodales. Donec ut nibh eu lectus luctus consectetur nec at
      dui. Sed aliquet diam at sapien ullamcorper, non pulvinar quam tincidunt. Aenean in elit eu tortor scelerisque
      suscipit. Curabitur placerat dui vitae turpis pulvinar, vitae mollis metus tristique. Donec suscipit porta congue.
      Pellentesque nec nunc rhoncus, dignissim nisl at, tempor lorem. Sed bibendum elit eu nulla luctus, a aliquet sem
      congue. Duis vitae nibh metus. Duis mattis ante eget justo posuere feugiat. Vestibulum aliquam quis libero in
      congue. Ut gravida tellus quis est iaculis ultricies. Donec pretium suscipit ex sit amet fermentum. Fusce id
      maximus nisl. In ac arcu nec magna hendrerit vehicula.

      Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nulla vitae ex enim.
      Curabitur enim sem, semper vel ipsum vel, pretium condimentum orci. Duis egestas, nisi quis convallis porttitor,
      felis arcu commodo elit, id aliquet enim leo ut sapien. Nulla massa enim, dictum iaculis pharetra nec, pharetra
      eget enim. Nam quis convallis neque, quis rutrum libero. Morbi viverra egestas erat, in interdum magna pretium ut.
      Aliquam vel purus eget nisi luctus ultricies et vitae metus. Pellentesque facilisis est id mattis lobortis. Donec
      pharetra dolor elit, sed venenatis ex cursus at. Suspendisse vehicula placerat dui, at ullamcorper sem vehicula
      id. Morbi nec eros tempor, ultricies quam ac, tincidunt purus. Phasellus nisl enim, faucibus nec sollicitudin sit
      amet, commodo in augue. Proin dolor urna, sodales nec venenatis vel, volutpat nec lacus. Proin dapibus, sem eu
      gravida convallis, augue metus lobortis nunc, nec placerat tellus mi vel ex. Vivamus vestibulum vehicula ante in
      tristique.

      Nullam id finibus nunc. Mauris sodales sodales bibendum. Praesent in lorem neque. Aenean pellentesque elit a nibh
      faucibus, eu tristique urna malesuada. Interdum et malesuada fames ac ante ipsum primis in faucibus. Cras
      pulvinar, purus pulvinar elementum convallis, quam massa consectetur orci, eu vehicula libero mauris vel tellus.
      Etiam id porttitor nunc, a mollis tortor. Donec et sodales nisi. Nunc turpis lectus, aliquam sed luctus id, tempor
      vel lectus. Vestibulum euismod felis vitae aliquet ornare. Fusce euismod, turpis eu lobortis malesuada, massa
      libero placerat lorem, ut commodo neque est non dolor.

      Vivamus sollicitudin pulvinar dolor. Aenean dictum ex sed risus lacinia, convallis pharetra diam porta. Nullam sed
      nibh vel justo imperdiet laoreet non eu elit. Cras at diam aliquet, consectetur arcu ut, fermentum lorem. Aenean
      eleifend iaculis est, eu pretium tortor maximus ac. Sed finibus metus ac odio fermentum, non congue risus
      ullamcorper. Quisque urna quam, posuere id commodo in, faucibus sed mi.

      Duis porttitor turpis at libero bibendum, vel laoreet dolor feugiat. Quisque sit amet eros at ex auctor cursus ac
      semper nunc. Mauris turpis diam, maximus eget tellus nec, fermentum pellentesque augue. Maecenas sit amet placerat
      neque. Morbi posuere non metus vitae venenatis. Maecenas euismod diam eget vestibulum rhoncus. In ut eros ac est
      aliquam vestibulum. Pellentesque erat libero, dapibus vel sagittis nec, convallis eu dui.

      Phasellus tempus eros vel mauris semper, a tincidunt leo imperdiet. Vestibulum gravida elit a vulputate molestie.
      Nam at velit lorem. Nunc pellentesque luctus tortor at tincidunt. Suspendisse luctus sollicitudin erat sed
      viverra. Fusce porttitor nec neque eget tristique. Aliquam erat volutpat.
    </Typography>
  </>
);

export default HomePage;
